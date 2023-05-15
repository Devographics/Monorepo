"use client";
import { addComponentToQuestionObject } from "~/responses/customComponents";
import { getQuestionObject } from "~/surveys/parser/parseSurvey";

export const FormQuestion = (props) => {
  const {
    survey,
    edition,
    section,
    response,
    question: questionMetadata,
    index,
    sectionNumber,
    questionNumber,
  } = props;

  const question = getQuestionObject({
    survey,
    edition,
    section,
    question: questionMetadata,
  });

  const { formPaths } = question;
  const qWithComponent = addComponentToQuestionObject(question);
  const Component = qWithComponent.input;
  const path = formPaths.response;
  if (!path) {
    throw new Error(`Could not find response path for question ${question.id}`);
  }
  const value = response?.[path];

  const componentProperties = {
    ...props,
    question,
    path,
    value,
    sectionNumber,
    questionNumber,
    isFirstQuestion: sectionNumber === 1 && questionNumber === 1,
  };

  return (
    <div className="form-input">
      <Component {...componentProperties} />
      {/* <pre>
        <code>{JSON.stringify(question, null, 2)}</code>
      </pre> */}
    </div>
  );
};

export default FormQuestion;
