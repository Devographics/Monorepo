"use client";
import { getQuestionComponent } from "~/lib/customComponents";
import { getFormPaths } from "~/lib/surveys/helpers";

export const FormQuestion = (props) => {
  const {
    survey,
    edition,
    section,
    response,
    question,
    index,
    sectionNumber,
    questionNumber,
  } = props;

  // const question = getQuestionObject({
  //   survey,
  //   edition,
  //   section,
  //   question: questionMetadata,
  // });
  // const { formPaths } = question;

  const formPaths = getFormPaths({ edition, question });
  const Component = getQuestionComponent(question);
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
