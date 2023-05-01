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
import type { Survey, Edition, Section, Question } from "@devographics/types";

import { getTemplate } from "./schemaTemplates";

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
export const addTemplateToQuestionObject = ({
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
}) => {
  // get template from either question or parent section
  const templateName = question?.template || section?.template;
  // Question does not necessarilly use a known template, it's ok if templateName is not defined
  if (templateName) {
    const questionTemplate = getTemplate(templateName);
    if (questionTemplate) {
      console.log("// addTemplateToQuestionObject");
      console.log(question);
      const templateOutput = questionTemplate({
        survey,
        edition,
        section,
        question,
      });
      console.log(templateOutput);
      question = {
        ...question,
        ...templateOutput,
      };
    } else {
      console.warn(`Template ${templateName} does not exist.`);
    }
  }

  return question;
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
