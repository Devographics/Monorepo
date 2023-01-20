/**
 * Do NOT import all surveys, these helpers works at survey level
 * This avoid bundling all surveys in a page
 */
import { ResponseDocument, SerializedSurveyDocument, SurveyDocument, SurveySection } from "@devographics/core-models";
import { fetchSurveysList, SurveyDescription } from "~/surveys/list";
import { getQuestionObject } from "./parser/parseSurvey";

export const getCommentFieldName = fieldName => fieldName.replace("__experience", "__comment")

export const getSurveyFieldNames = (survey: SerializedSurveyDocument | SurveyDocument) => {
  let questionFieldNames: Array<string> = [];
  survey.outline.forEach((section) => {
    section.questions &&
      section.questions.forEach((questionOrId) => {
        const questionObject = getQuestionObject(questionOrId, section);
        /*
        const questionId = getQuestionId(
          survey,
          section,
          questionObject
        );
        */
        if (!questionObject.fieldName) {
          return;
        }
        questionFieldNames.push(questionObject.fieldName);
        if (questionObject.hasComment) {
          questionFieldNames.push(getCommentFieldName(questionObject.fieldName));
        }
      });
  });
  // remove dups (different suffix for same question)
  const fieldNamesWithoutDups = [...new Set(questionFieldNames).values()];
  return fieldNamesWithoutDups;
};


export const getSurveyDescriptionFromResponse = async (response: ResponseDocument): Promise<SurveyDescription | undefined> => {
  const surveys = await fetchSurveysList()
  return surveys.find((s) => s.slug === response.surveySlug);
}

export const getSurveyPath = ({
  survey,
  number,
  response,
  home = false,
  page,
  readOnly,
}: {
  // we only need basic info about the survey
  survey?: SurveyDescription;
  number?: any;
  response?: any;
  home?: boolean;
  page?: "thanks";
  readOnly?: boolean;
}) => {
  if (!survey) {
    console.warn("Survey not passed as props, will use empty path")
    return "";
  }
  const { year, prettySlug } = survey;
  const prefixSegment = "/survey";
  const slugSegment = prettySlug;
  const yearSegment = year;
  const pathSegments = [prefixSegment, slugSegment, yearSegment];

  if (!home) {
    if (readOnly) {
      const readOnlySegment = "read-only";
      pathSegments.push(readOnlySegment);
    } else {
      const responseSegment = response && `${response._id}`;
      pathSegments.push(responseSegment);
    }

    const suffixSegment = page || number || 1;
    pathSegments.push(suffixSegment);
  }
  const path = pathSegments.join("/");
  return path;
};

export const getSurveyTitle = ({
  survey,
  sectionTitle,
}: {
  survey: SurveyDocument;
  sectionTitle?: string;
}) => {
  const { name, year } = survey;
  let title = `${name} ${year}`;
  if (sectionTitle) {
    title += `: ${sectionTitle}`;
  }
  return title;
};

export const getSectionKey = (section: SurveySection, keyType = "title") =>
  `sections.${section.intlId || section.id}.${keyType}`;
