import type {
  Entity,
  OptionMetadata,
  ResponseDocument,
  SurveyMetadata,
} from "@devographics/types";
import {
  EditionMetadata,
  SectionMetadata,
  QuestionMetadata,
  DbPaths,
} from "@devographics/types";
import { isAbsoluteUrl } from "~/lib/utils";
import { LocaleDef } from "~/i18n/typings";
import { reverseSurveyParamsLookup } from "./data";
import { outlineSegment } from "../routes";
import { useIntlContext } from "@devographics/react-i18n";
import {
  getQuestioni18nIds,
  getOptioni18nIds,
  getSectioni18nIds,
} from "@devographics/i18n";
import type { Metadata } from "next";
import { publicConfig } from "~/config/public";
import { rscIntlContext } from "~/i18n/rsc-fetchers";
import { rscMustGetSurveyEditionFromUrl } from "~/app/[lang]/survey/[slug]/[year]/rsc-fetchers";
import { getCommonContexts, getEditionContexts } from "~/i18n/config";

/*

Note: we currently need to prefix all paths with the edition id

TODO: In the future, get rid of this prefix, and replace formPaths with rawPaths?

*/
export const getFormPaths = ({
  edition,
  question,
}: {
  edition: EditionMetadata;
  question: QuestionMetadata;
}): DbPaths => {
  const paths: { [key in keyof DbPaths]: string } = {};
  if (question.rawPaths) {
    (Object.keys(question.rawPaths) as Array<keyof DbPaths>).forEach((key) => {
      const path = question?.rawPaths?.[key];
      if (path) {
        paths[key] = `${edition.id}__${path}`;
      }
    });
  }
  return paths;
};

/**
 * Get the main survey image,
 * handling legacy scenario of a relative image path
 *
 * @param edition
 * @returns A relative or absolute URL of the main survey image
 */
const variants = {
  og: "png",
  sidebar: "svg",
  square: "png",
};
export const getSurveyImageUrl = (
  edition: EditionMetadata,
  variant?: "og" | "sidebar" | "square"
) => {
  const variantSuffix = variant ? `-${variant}` : "";
  const extension = variant ? variants[variant] : "png";
  const imageUrl = `https://assets.devographics.com/surveys/${edition.id}${variantSuffix}.${extension}`;
  if (!imageUrl) return;
  let finalImageUrl = isAbsoluteUrl(imageUrl)
    ? imageUrl
    : // legacy behaviour
      `/surveys/${imageUrl}`;

  return finalImageUrl;
};

export function getEditionSectionPath({
  survey,
  edition,
  locale,
  readOnly,
  response,
  page,
  number,
}: {
  // we only need basic info about the survey
  edition: Pick<EditionMetadata, "id">;
  survey: Pick<SurveyMetadata, "id">;
  /** [state-of-js, 2022] */
  locale: LocaleDef;
  /** No response is needed in read only mode */
  readOnly?: boolean;
  // section
  // TODO: why sometimes we have "id" vs "_id"? (_id coming from Mongo, id from Vulcan probably)
  response?: Partial<Pick<ResponseDocument, "_id">>;
  number?: any;
  page?: "finish";
}) {
  const { surveySlug, editionSlug } = reverseSurveyParamsLookup({
    surveyId: survey.id,
    editionId: edition.id,
  });
  const pathSegments = [locale.id, "survey", surveySlug, editionSlug];

  if (readOnly) {
    pathSegments.push(outlineSegment);
  } else {
    const responseSegment = response?._id;
    if (!responseSegment) {
      console.log(response);
      throw new Error(
        "Response object has no id or _id. We may have failed to load your response from server."
      );
    }
    pathSegments.push(responseSegment);
  }
  const suffixSegment = page || number || 1;
  pathSegments.push(suffixSegment);
  const path = pathSegments.join("/");
  return `/${path}`;
}

export function getEditionHomePath({
  edition,
  locale,
}: {
  edition: EditionMetadata;
  locale: LocaleDef;
}) {
  const { surveySlug, editionSlug } = reverseSurveyParamsLookup({
    surveyId: edition.survey.id,
    editionId: edition.id,
  });
  const prefixSegment = "survey";
  return "/" + [locale.id, prefixSegment, surveySlug, editionSlug].join("/");
}

export interface QuestionWithSection extends QuestionMetadata {
  section: SectionMetadata;
}

export interface EntityWithQuestion extends Entity {
  question: QuestionWithSection;
}

export const getEditionQuestions = (
  edition: EditionMetadata
): Array<QuestionWithSection> =>
  edition.sections
    .map((s) => s.questions.map((q) => ({ ...q, section: s })))
    .flat();

export const getEditionEntities = (
  edition: EditionMetadata
): Array<EntityWithQuestion> => {
  const allQuestions = getEditionQuestions(edition);

  // decorate each question's entity with the question
  // so we can figure out the entity's label later on
  const questionEntities = allQuestions
    .filter((q) => q.entity)
    .map((question) => ({
      ...question.entity,
      question,
    })) as Array<EntityWithQuestion>;

  const optionEntities = allQuestions
    .map((question) =>
      question.options?.map((o) => {
        // decorate each option's entity with question the option belongs to
        // so we can figure out the entity's label later on
        if (o.entity) {
          return { ...o, entity: { ...o.entity, question } };
        } else {
          return o;
        }
      })
    )
    .flat()
    .filter((o) => o?.entity)
    .map((o) => o?.entity) as Array<EntityWithQuestion>;
  const allEntities = [...questionEntities, ...optionEntities];
  return allEntities;
};

export const getEntityName = (entity) => {
  if (!entity) return;
  const { name, nameClean, nameHtml } = entity;
  return nameHtml || nameClean || name;
};

export const useQuestionTitle = ({
  section,
  question,
}: {
  section: SectionMetadata;
  question: QuestionMetadata;
}) => {
  const intl = useIntlContext();
  const { entity } = question;
  const i18n = getQuestioni18nIds({ section, question });

  const entityNameHtml = entity && (entity.nameHtml || entity.name);
  const entityNameClean = entity && (entity.nameClean || entity.name);

  // TODO: formatMessage should return an object with html and clean versions
  // instead of just a string
  const i18nNameHtml = intl.formatMessage({ id: i18n.base });
  const i18nNameClean = intl.formatMessage({ id: i18n.base });

  return {
    html: entityNameHtml || i18nNameHtml,
    clean: entityNameClean || i18nNameClean,
  };
};

export const useOptionTitle = ({
  question,
  option,
}: {
  question: QuestionMetadata;
  option: OptionMetadata;
}) => {
  const intl = useIntlContext();
  const { entity } = option;
  const i18n = getOptioni18nIds({ question, option });

  const entityNameHtml = entity && (entity.nameHtml || entity.name);
  const entityNameClean = entity && (entity.nameClean || entity.name);

  // TODO: formatMessage should return an object with html and clean versions
  // instead of just a string
  const i18nNameHtml = intl.formatMessage({ id: i18n.base });
  const i18nNameClean = intl.formatMessage({ id: i18n.base });

  return {
    html: entityNameHtml || i18nNameHtml,
    clean: entityNameClean || i18nNameClean,
  };
};

export const getMetadata = async ({ params }: { params: any }) => {
  const { lang, sectionNumber } = params;
  const edition = await rscMustGetSurveyEditionFromUrl(params);

  const contexts = [...getCommonContexts(), ...getEditionContexts({ edition })];
  const intlContext = await rscIntlContext({ localeId: lang, contexts });

  const { socialImageUrl, year } = edition;
  const { name = "" } = edition.survey;

  const imageUrl = getSurveyImageUrl(edition);
  let imageAbsoluteUrl = socialImageUrl || imageUrl;
  const url = publicConfig.appUrl;
  const description = intlContext.formatMessage({
    id: "general.take_survey",
    values: { name, year: year + "" },
  });

  let title = `${name} ${year}`;

  const section =
    sectionNumber && edition.sections?.[parseInt(sectionNumber) - 1];

  if (section) {
    const { title: sectionTitleId } = getSectioni18nIds({ section });
    const sectionTitle = intlContext.formatMessage({ id: sectionTitleId });
    title += `: ${sectionTitle}`;
  }

  const meta: Metadata = {
    title,
    description,
    // NOTE: merge between route segments is shallow, you may need to repeat field from layout
    openGraph: {
      // @ts-ignore
      type: "article" as const,
      url,
      images: imageAbsoluteUrl,
    },
    twitter: {
      // @ts-ignore
      card: "summary" as const,
      images: imageAbsoluteUrl,
    },
    alternates: {
      canonical: url,
      // we could create alternates for languages too
    },
  };

  return meta;
};
