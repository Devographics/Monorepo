import {
  QuestionTemplateOutput,
  TemplateArguments,
  TemplateFunction,
} from "@devographics/types";
import * as templateFunctions from "@devographics/templates";

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
    console.warn(
      `getQuestionObject: could not find template ${question.template} for question ${question.id}`
    );
    return question as QuestionTemplateOutput;
    // throw new Error(
    //   `getQuestionObject: could not find template ${question.template} for question ${question.id}`
    // );
  }
  const questionObject = templateFunction({
    survey,
    edition,
    section,
    question,
  });
  return questionObject;
};
