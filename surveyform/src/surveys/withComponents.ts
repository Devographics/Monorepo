import surveys from "~/surveys";

import RaceEthnicity from "~/core/components/forms/RaceEthnicity";
import Email2 from "~/core/components/forms/Email2";
import Hidden from "~/core/components/forms/Hidden";
import { Help } from "~/core/components/forms/Help";
import Bracket from "~/core/components/forms/Bracket";
import { makeAutocomplete } from "@vulcanjs/graphql";

const customComponents = {
  help: Help,
  email2: Email2,
  hidden: Hidden,
  raceEthnicity: RaceEthnicity,
  bracket: Bracket
}

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
const addComponentToQuestionObject = (
  questionObject: ParsedQuestion,
) => {
  const customComponent = customComponents[questionObject.input]
  if (customComponent) {
    let questionWithComponent = {...questionObject, input: customComponent}
    if (questionWithComponent.autocompleteOptions) {
      questionWithComponent = makeAutocomplete(questionWithComponent, questionWithComponent.autocompleteOptions)
    }
    return questionWithComponent
  }
  return questionObject;
};

/**
 * Add templates to a parsed survey (mutate the object directly)
 * @param parsedSurvey
 * @returns
 */
export const addComponentsToSurvey = (parsedSurvey: SurveyDocument) => {
  // @ts-ignore
  parsedSurvey.outline = parsedSurvey.outline.map((section) => {
    return {
      ...section,
      questions:
        section.questions &&
        // @ts-ignore
        section.questions.map(addComponentToQuestionObject),
    };
  });
  return parsedSurvey;
};


/**
 * Surveys that can be rendered in React based on their template
 *
 * For non-react code, prefer loading "surveys"
 */
const surveysWithComponents = surveys.map(addComponentsToSurvey);

export default surveysWithComponents