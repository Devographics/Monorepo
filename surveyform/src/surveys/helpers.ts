/**
 * Do NOT import all surveys, these helpers works at survey level
 * This avoid bundling all surveys in a page
 */
import {
  SurveyEdition,
  SurveySection,
  SurveyEditionDescription,
  ResponseDocument,
} from "@devographics/core-models";
import {
  EditionMetadata,
  SectionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import { getQuestionObject } from "./parser/parseSurvey";

export const surveyParamsTable = {
  "state-of-css": {
    2019: { surveyId: "state_of_css", editionId: "css2019" },
    2020: { surveyId: "state_of_css", editionId: "css2020" },
    2021: { surveyId: "state_of_css", editionId: "css2021" },
    2022: { surveyId: "state_of_css", editionId: "css2022" },
    2023: { surveyId: "state_of_css", editionId: "css2023" },
  },
  "state-of-graphql": {
    2022: { surveyId: "state_of_css", editionId: "graphql2022" },
  },
  "state-of-js": {
    2016: { surveyId: "state_of_js", editionId: "js2016" },
    2017: { surveyId: "state_of_js", editionId: "js2017" },
    2018: { surveyId: "state_of_js", editionId: "js2018" },
    2019: { surveyId: "state_of_js", editionId: "js2019" },
    2020: { surveyId: "state_of_js", editionId: "js2020" },
    2021: { surveyId: "state_of_js", editionId: "js2021" },
    2022: { surveyId: "state_of_js", editionId: "js2022" },
    2023: { surveyId: "state_of_js", editionId: "js2023" },
  },
};

export const getCommentFieldName = (fieldName) =>
  fieldName.replace("__experience", "__comment");

export const getSurveyFieldNames = (edition: EditionMetadata) => {
  let questionFieldNames: Array<string> = [];
  edition.sections.forEach((section) => {
    section.questions &&
      section.questions.forEach((question) => {
        const questionObject = getQuestionObject({
          survey: edition.survey,
          edition,
          section,
          question,
        });
        /*
        const questionId = getQuestionId(
          survey,
          section,
          questionObject
        );
        */
        if (!questionObject.rawPaths?.response) {
          return;
        }
        questionFieldNames.push(questionObject.rawPaths.response);
        if (questionObject.allowComment && questionObject.rawPaths?.comment) {
          questionFieldNames.push(questionObject.rawPaths?.comment);
        }
      });
  });
  // remove dups (different suffix for same question)
  const fieldNamesWithoutDups = [...new Set(questionFieldNames).values()];
  return fieldNamesWithoutDups;
};

type ReverseEditionParam = {
  slugSegment: string;
  yearSegment: string;
  surveyId: string;
  editionId: string;
};

function getEditionPathSegments(edition: EditionMetadata): Array<string> {
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
  const { slugSegment, yearSegment } = reverseParamEntry;
  const prefixSegment = "/survey";
  const pathSegments = [prefixSegment, slugSegment, yearSegment];
  return pathSegments;
}

// survey home
export function getEditionHomePath(edition: EditionMetadata) {
  return getEditionPathSegments(edition).join("/");
}

export function getReadOnlyPath({
  survey,
}: {
  survey: SurveyEditionDescription;
}) {}
// specific section path for the form
export function getEditionSectionPath({
  edition,
  forceReadOnly,
  response,
  page,
  number,
}: {
  // we only need basic info about the survey
  edition: EditionMetadata;
  // forceReadOnly (no response needed in this case)
  forceReadOnly?: boolean;
  // section
  // TODO: why sometimes we have "id" vs "_id"? (_id coming from Mongo, id from Vulcan probably)
  response?: Partial<Pick<ResponseDocument, "_id" | "id">>;
  number?: any;
  page?: "thanks";
}) {
  const pathSegments = getEditionPathSegments(edition);
  // survey home
  const readOnly =
    forceReadOnly || !edition.status || ![1, 2].includes(edition.status);
  if (readOnly) {
    const readOnlySegment = "read-only";
    pathSegments.push(readOnlySegment);
  } else {
    if (!response) throw new Error("Undefined response");
    const responseSegment = response.id || response._id;
    if (!responseSegment)
      throw new Error(
        "Response object has no id or _id. We may have failed to load your response from server."
      );
    pathSegments.push(responseSegment);
  }
  const suffixSegment = page || number || 1;
  pathSegments.push(suffixSegment);
  const path = pathSegments.join("/");
  return path;
}

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
