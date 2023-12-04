import {
  TemplateArguments,
  TemplateFunction,
  QuestionWithSection,
} from "@devographics/types";
import { templateFunctions } from "@devographics/templates";

export const getQuestionObject = ({
  survey,
  edition,
  section,
  question,
}: TemplateArguments) => {
  if (!survey) throw new Error(`getQuestionObject: survey is undefined`);
  if (!edition) throw new Error(`getQuestionObject: edition is undefined`);
  if (!section) throw new Error(`getQuestionObject: section is undefined`);
  if (!question) throw new Error(`getQuestionObject: question is undefined`);

  const templateFunction = templateFunctions[
    question.template
  ] as TemplateFunction;
  if (!templateFunction) {
    return { ...question, section } as QuestionWithSection;
  }
  const questionObject = templateFunction({
    survey,
    edition,
    section,
    question,
  });
  return questionObject;
};
