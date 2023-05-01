import type {
  Field,
  SurveySection,
  SurveyEdition,
} from "@devographics/core-models";
import { applyTemplateToQuestionObject } from "./addTemplateToSurvey";
import type {
  Survey,
  Edition,
  Section,
  Question,
  EditionMetadata,
  QuestionMetadata,
} from "@devographics/types";
import { QuestionFormTemplateOutput } from "./addTemplateToSurvey";

export interface QuestionFormObject extends QuestionFormTemplateOutput {
  type: NumberConstructor | StringConstructor;
}

// build question object from outline
export const getQuestionObject = ({
  survey,
  edition,
  section,
  question,
  number,
}: {
  survey: Survey;
  edition: Edition;
  section: Section;
  question: Question;
  number?: number;
  // questionObject: Field & {
  //   slug?: any;
  //   type?: any;
  //   fieldType?: any;
  //   showOther?: boolean;
  //   allowother?: boolean;
  // },
  // section: SurveySection
  // number?: number
}): QuestionFormObject => {
  // question.slug = question.id;
  // question.type = String; // default to String type

  // question.showOther = question.allowother;

  // apply template to question
  const questionTemplateOutput = applyTemplateToQuestionObject({
    survey,
    edition,
    section,
    question,
    number,
  });
  const questionFormObject = {
    ...questionTemplateOutput,
    type: question.optionsAreNumeric ? Number : String,
  };

  return questionFormObject;
};

/**
 * Functions that gets a safe unique id per survey edition,
 * taking legacy fields into account
 * @param survey
 * @returns js2022, graphql2022, css2022 etc.
 */
export function getSurveyEditionId(survey: SurveyEdition) {
  //console.log("survey", survey)
  // js2022 etc.
  const editionId =
    survey.editionId || survey.surveyId || survey.id || survey.slug;
  return editionId;
}
/**
 * state_of_js
 * @param survey
 * @returns
 */
export function getSurveyContextId(survey: SurveyEdition) {
  // state_of_js
  const surveyId = survey.surveyId || survey.context;
  return surveyId!;
}
/** 
Note: section's slug can be overriden by the question

Get question unique id, to be used in the schema

/!\ different from the graphql field names

*/
export const getQuestionId = (edition: EditionMetadata, section, question) => {
  const editionId = edition.id;
  const sectionSlug = question.sectionSlug || section.slug || section.id;
  let fieldName = editionId + "__" + sectionSlug + "__" + question.id;
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
export const parseEdition = (edition: EditionMetadata): Edition => {
  let i = 0;
  const survey = { id: edition.surveyId } as Survey;
  const parsedEdition = {
    ...edition,
    createdAt: edition.createdAt ? new Date(edition.createdAt) : undefined,
  };
  parsedEdition.sections = edition.sections.map((section) => {
    const questions = section.questions.map((question) => {
      i++;
      // @ts-ignore TODO: question may be an array according to types
      const questionObject = getQuestionObject({
        survey,
        edition,
        section,
        question,
        number: i,
      });
      questionObject.fieldName = getQuestionId(
        edition,
        section,
        questionObject
      );
      return questionObject;
    });
    return {
      ...section,
      questions,
    } as SurveySection;
  });
  // @ts-ignore
  return parsedEdition;
};
