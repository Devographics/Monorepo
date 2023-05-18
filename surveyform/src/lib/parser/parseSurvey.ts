import { applyTemplateToQuestionObject } from "./addTemplateToSurvey";
import type {
  EditionMetadata,
  SectionMetadata,
  QuestionMetadata,
  SurveyMetadata,
  DbPaths,
} from "@devographics/types";
import { QuestionFormTemplateOutput } from "./addTemplateToSurvey";
import { QuestionFormObject } from "~/components/form/typings";
import { getQuestionObject } from "~/lib/surveys/helpers";

// import allTemplates from "@devographics/templates";

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
