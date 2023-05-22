import {
  EditionMetadata,
  SectionMetadata,
  QuestionMetadata,
  DbPaths,
} from "@devographics/types";
import { isAbsoluteUrl } from "~/lib/utils";

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
export const getSurveyImageUrl = (edition: EditionMetadata) => {
  const { imageUrl } = edition;
  if (!imageUrl) return;
  let finalImageUrl = isAbsoluteUrl(imageUrl)
    ? imageUrl
    : // legacy behaviour
      `/surveys/${imageUrl}`;

  return finalImageUrl;
};

export const getEditionTitle = ({
  edition,
  sectionTitle,
}: {
  edition: EditionMetadata;
  sectionTitle?: string;
}) => {
  const { year, survey } = edition;
  const { name } = survey!;
  let title = `${name} ${year}`;
  if (sectionTitle) {
    title += `: ${sectionTitle}`;
  }
  return title;
};

export const getSectionKey = (section: SectionMetadata, keyType = "title") =>
  `sections.${section.intlId || section.id}.${keyType}`;

type ReverseEditionParam = {
  slugSegment: string;
  yearSegment: string;
  surveyId: string;
  editionId: string;
};
export type SurveyParamsTable = {
  [slug: string]: {
    /** NOTE: could be a string like "summer-2022" */
    [year: string]: {
      surveyId: string;
      editionId: string;
    };
  };
};

// js2022 => [state-of-js, 2022]
function getEditionPathSegments(
  edition: EditionMetadata,
  surveyParamsTable: SurveyParamsTable
): Array<string> {
  const { id: editionId } = edition;
  const reverseEditionsParams = [] as ReverseEditionParam[];
  for (const slugSegment of Object.keys(surveyParamsTable)) {
    for (const yearSegment of Object.keys(surveyParamsTable[slugSegment])) {
      reverseEditionsParams.push({
        ...surveyParamsTable[slugSegment][yearSegment],
        slugSegment,
        yearSegment,
      });
    }
  }

  const reverseParamEntry = reverseEditionsParams.find(
    (e) => e.editionId === editionId
  )!;
  if (!reverseParamEntry) {
    console.debug({ reverseEditionsParams });
    throw new Error(
      `Could not get reverseParamEntry for edition ${editionId}.`
    );
  }
  const { slugSegment, yearSegment } = reverseParamEntry;
  const prefixSegment = "/survey";
  const pathSegments = [prefixSegment, slugSegment, yearSegment];
  return pathSegments;
}
export function getEditionHomePath(
  edition: EditionMetadata,
  surveyParamsTable: SurveyParamsTable
) {
  return getEditionPathSegments(edition, surveyParamsTable).join("/");
}
