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
  SectionMetadata,
  QuestionMetadata,
  SurveyMetadata,
  DbPaths,
} from "@devographics/types";
import { QuestionFormTemplateOutput } from "./addTemplateToSurvey";
// import allTemplates from "@devographics/templates";

export interface QuestionFormObject extends QuestionFormTemplateOutput {
  type: NumberConstructor | StringConstructor;
  formPaths: DbPaths;
}

/*

Note: we currently need to prefix all paths with the edition id

TODO: In the future, get rid of this prefix, and replace formPaths with rawPaths?

*/
const getFormPaths = ({
  edition,
  question,
}: {
  edition: EditionMetadata;
  question: QuestionMetadata;
}): DbPaths => {
  const paths = {};
  if (question.rawPaths) {
    Object.keys(question.rawPaths).forEach((key) => {
      const path = question?.rawPaths?.[key];
      if (path) {
        paths[key] = `${edition.id}__${path}`;
      }
    });
  }
  return paths;
};

// build question object from outline
export const getQuestionObject = ({
  survey,
  edition,
  section,
  question,
  number,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  section: SectionMetadata;
  question: QuestionMetadata;
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
  let questionObject = question;
  // question.slug = question.id;
  // question.type = String; // default to String type

  // question.showOther = question.allowother;

  // get template from either question or parent section
  const templateName = question?.template || section?.template;
  if (!templateName) {
    throw new Error(
      `Question ${question.id} does not have a template specified.`
    );
  }

  // apply core template to question
  // NOTE: not currently necessary, we get all the data we need from API
  // const coreTemplate = allTemplates[templateName];
  // if (coreTemplate) {
  //   questionObject = coreTemplate({ survey, edition, section, question });
  // }

  // apply form template to question
  const questionTemplateOutput = applyTemplateToQuestionObject({
    survey,
    edition,
    section,
    question: questionObject,
    number,
  });

  // add extra properties
  const formPaths = getFormPaths({ edition, question });
  const questionFormObject = {
    ...questionTemplateOutput,
    type: question.optionsAreNumeric ? Number : String,
    formPaths,
    fieldName: formPaths.response,
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

Take a raw survey YAML and process it to give ids, fieldNames, etc.
to every question

/!\ Will NOT add components, so that it can be reused in scripts

*/
export const parseEdition = (edition: EditionMetadata) => {
  let i = 0;
  const survey = { id: edition.surveyId } as SurveyMetadata;
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
      return questionObject;
    });
    return {
      ...section,
      questions,
    };
  });
  // @ts-ignore
  return parsedEdition;
};
