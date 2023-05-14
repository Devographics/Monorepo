"use client";
import { ErrorBoundary } from "~/core/components/error";
import { addComponentToQuestionObject } from "~/responses/customComponents";
import { parseOptions } from "~/responses/helpers";
import { getQuestionObject } from "~/surveys/parser/parseSurvey";

// const getOnChangeHandler = ({
//   edition,
//   section,
//   question,
//   response,
//   updateCurrentValues,
// }) => {
//   return (event) => {
//     const path = question.formPaths.response;
//     const value = event.target.value;
//     updateCurrentValues(path, value);
//   };
// };

export const FormQuestion = (props) => {
  const {
    survey,
    edition,
    section,
    response,
    question: questionMetadata,
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
  const options = question.options && parseOptions(question, question.options);

  const componentProperties = {
    ...props,
    question,
    path,
    options,
    value,
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
