/**
 * Ties React components to survey via templates
 *
 * This is usually needed only in the survey form, not in scripts
 *
 * This code will load JSX components
 */
import type {
  ParsedQuestion,
  SurveyDocument,
  SurveySection,
} from "@devographics/core-models";

import { templates } from "./schemaTemplates";

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
export const addTemplateToQuestionObject = (
  questionObject: ParsedQuestion,
  section: SurveySection,
  number?: number
) => {
  // get template from either question or parent section
  const templateName = questionObject?.template || section?.template;
  // Question does not necessarilly use a known template, it's ok if templateName is not defined
  if (templateName) {
    const questionTemplate = templates[templateName];
    if (questionTemplate) {
      const template = questionTemplate(questionObject);
      questionObject = {
        ...questionObject,
        ...template,
      };
    } else {
      console.warn(`Template ${templateName} does not exist.`);
    }
  }

  return questionObject;
};

/**
 * Add templates to a parsed survey (mutate the object directly)
 * @param parsedSurvey
 * @returns
 */
export const addTemplatesToSurvey = (parsedSurvey: SurveyDocument) => {
  let i = 0;
  // @ts-ignore
  parsedSurvey.outline = parsedSurvey.outline.map((section) => {
    return {
      ...section,
      questions:
        section.questions &&
        // @ts-ignore
        section.questions.map((question: ParsedQuestion) => {
          i++;
          // @ts-ignore TODO: question may be an array according to types
          const questionObject = addTemplateToQuestionObject(
            question,
            section,
            i
          );
          return questionObject;
        }),
    };
  });
  return parsedSurvey;
};
