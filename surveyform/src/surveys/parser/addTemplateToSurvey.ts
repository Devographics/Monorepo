/**
 * Ties React components to survey via templates
 *
 * This is usually needed only in the survey form, not in scripts
 *
 * This code will load JSX components
 */
import type {
  ParsedQuestion,
  SurveyEdition,
  SurveySection,
} from "@devographics/core-models";
import type {
  Survey,
  Edition,
  Section,
  Question,
  QuestionMetadata,
  SectionMetadata,
  EditionMetadata,
  SurveyMetadata,
} from "@devographics/types";

import { getTemplate } from "./schemaTemplates";

export interface FormTemplateOutput {
  input: string;
  arrayItem?: {
    type: any;
    optional: boolean;
  };
  autocompleteOptions?: {
    autocompletePropertyName: string;
    labelsQueryResolverName: string;
    autocompleteQueryResolverName: string;
    fragmentName: string;
  };
  randomize?: boolean;
}

export interface QuestionFormTemplateOutput
  extends FormTemplateOutput,
    QuestionMetadata {}

/**
 * Add React component to templates
 *
 * /!\ Importing this file will load some React
 * so involves JSX, it should not be used in scripts
 * @param questionObject
 * @param section
 * @param number
 * @returns
 */
export const applyTemplateToQuestionObject = ({
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
}): QuestionFormTemplateOutput => {
  const templateName =
    question?.extends || question?.template || section?.template;

  if (!templateName) {
    throw new Error(
      `Question ${question.id} does not have a template defined.`
    );
  }

  const questionTemplate = getTemplate(templateName);

  if (!questionTemplate) {
    throw new Error(`Template ${templateName} does not exist.`);
  }
  // console.log("// addTemplateToQuestionObject");
  // console.log(question);
  const templateOutput: QuestionFormTemplateOutput = questionTemplate({
    survey,
    edition,
    section,
    question,
  });
  // console.log(templateOutput);
  return { ...templateOutput, ...question };
};

// /**
//  * Add templates to a parsed survey (mutate the object directly)
//  * @param edition
//  * @returns
//  */
// export const addTemplatesToSurvey = (edition: SurveyEdition) => {
//   let i = 0;
//   // @ts-ignore
//   edition.outline = edition.outline.map((section) => {
//     return {
//       ...section,
//       questions:
//         section.questions &&
//         // @ts-ignore
//         section.questions.map((question: ParsedQuestion) => {
//           i++;
//           // @ts-ignore TODO: question may be an array according to types
//           const questionObject = addTemplateToQuestionObject(
//             question,
//             section,
//             i
//           );
//           return questionObject;
//         }),
//     };
//   });
//   return edition;
// };
