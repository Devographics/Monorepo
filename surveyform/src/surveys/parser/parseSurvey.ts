import type {
  Field,
  SurveySection,
  SurveyEdition,
} from "@devographics/core-models";
import { addTemplateToQuestionObject } from "./addTemplateToSurvey";

// build question object from outline
export const getQuestionObject = (
  questionObject: Field & {
    slug?: any;
    type?: any;
    fieldType?: any;
    showOther?: boolean;
    allowother?: boolean;
  },
  section: SurveySection
  // number?: number
) => {
  questionObject.slug = questionObject.id;
  questionObject.type = String; // default to String type

  questionObject.showOther = questionObject.allowother;

  // if type is specified, use it
  if (questionObject.fieldType) {
    if (questionObject.fieldType === "Number") {
      questionObject.type = Number;
    }
  }

  // apply template to question
  return addTemplateToQuestionObject(questionObject, section);
};

/**
 * Functions that gets a safe unique id per survey edition,
 * taking legacy fields into account
 * @param survey 
 * @returns js2022, graphql2022, css2022 etc.
 */
export function getSurveyEditionId(survey: SurveyEdition) {
  // js2022 etc.
  const surveyEditionId = survey.id || survey.surveyEditionId || survey.surveyId || survey.slug
  return surveyEditionId
}
/** 
Note: section's slug can be overriden by the question

Get question unique id, to be used in the schema

/!\ different from the graphql field names

*/
export const getQuestionId = (survey: SurveyEdition, section, question) => {
  const surveyEditionId = getSurveyEditionId(survey)
  const sectionSlug = question.sectionSlug || section.slug || section.id;
  let fieldName = surveyEditionId + "__" + sectionSlug + "__" + question.id;
  if (question.suffix) {
    fieldName += `__${question.suffix}`;
  }
  return fieldName;
};

/** 

Take a raw survey YAML and process it to give ids, fieldNames, etc.
to every question

/!\ Will NOT add components, so that it can be reused in scripts

*/
export const parseSurvey = (survey: SurveyEdition | SurveyEdition): SurveyEdition => {
  let i = 0;
  const parsedSurvey = { ...survey, createdAt: survey.createdAt ? new Date(survey.createdAt) : undefined };
  parsedSurvey.outline = survey.outline.map((section) => {
    const questions = section.questions.map((question) => {
      i++;
      // @ts-ignore TODO: question may be an array according to types
      const questionObject = getQuestionObject(question, section, i);
      questionObject.fieldName = getQuestionId(survey, section, questionObject);
      return questionObject;
    });
    return {
      ...section,
      questions,
    } as SurveySection;
  });
  // @ts-ignore
  return parsedSurvey;
};
