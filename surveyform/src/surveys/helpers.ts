/**
 * Do NOT import all surveys, these helpers works at survey level
 * This avoid bundling all surveys in a page
 */
import { SurveyEdition, SurveySection, SurveyEditionDescription, ResponseDocument } from "@devographics/core-models";
import { getQuestionObject } from "./parser/parseSurvey";

export const getCommentFieldName = fieldName => fieldName.replace("__experience", "__comment")

export const getSurveyFieldNames = (survey: SurveyEdition | SurveyEdition) => {
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


function getSurveyPathSegments(survey: SurveyEditionDescription): Array<string> {
  const { year, prettySlug } = survey;
  // console.log("SURVEY year", { year, prettySlug }, response)
  const prefixSegment = "/survey";
  const slugSegment = prettySlug!;
  const yearSegment = year! + "";
  const pathSegments = [prefixSegment, slugSegment, yearSegment];
  return pathSegments
}
// survey home
export function getSurveyHomePath(survey: SurveyEditionDescription) {
  return getSurveyPathSegments(survey).join("/")
}

export function getReadOnlyPath({ survey }: { survey: SurveyEditionDescription }) {
}
// specific section path for the form
export function getSurveySectionPath(
  props
    : {
      // we only need basic info about the survey
      survey: SurveyEditionDescription;
      // forceReadOnly (no response needed in this case)
      forceReadOnly?: boolean
      // section
      response?: ResponseDocument;
      number?: any;
      page?: "thanks";
    }) {
  const { survey, forceReadOnly, response, page, number } = props
  const pathSegments = getSurveyPathSegments(survey)
  // survey home
  const readOnly = forceReadOnly || !survey.status || ![1, 2].includes(survey.status)
  if (readOnly) {
    const readOnlySegment = "read-only";
    pathSegments.push(readOnlySegment);
  } else {
    if (!response) throw new Error("Undefined response")
    const responseSegment = response.id || response._id
    console.debug(response, response.id, response._id, response.id || response._id)
    if (!responseSegment) throw new Error("Response object has no id or _id. We may have failed to load your response from server.")
    pathSegments.push(responseSegment);
  }
  const suffixSegment = page || number || 1;
  pathSegments.push(suffixSegment);
  const path = pathSegments.join("/");
  return path
};

export const getSurveyTitle = ({
  survey,
  sectionTitle,
}: {
  survey: SurveyEdition;
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
