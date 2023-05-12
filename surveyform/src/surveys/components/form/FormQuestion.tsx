"use client";
import { ErrorBoundary } from "~/core/components/error";
import { addComponentToQuestionObject } from "~/responses/customComponents";
import { parseOptions } from "~/responses/helpers";

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
    question,
    stateStuff,
    updateCurrentValues,
    isFirstQuestion,
  } = props;
  const { setFormState } = stateStuff;
  const qWithComponent = addComponentToQuestionObject(question);
  const Component = qWithComponent.input;
  const path = question.formPaths.response;
  const value = response?.[question.formPaths.response];
  const options = question.options && parseOptions(question, question.options);

  const componentProperties = {
    response,
    path,
    options,
    value,
    survey,
    edition,
    section,
    question,
    updateCurrentValues,
    isFirstQuestion,
  };

  return (
    <ErrorBoundary>
      <div className="form-input">
        <Component {...componentProperties} />
        {/* <pre>
        <code>{JSON.stringify(question, null, 2)}</code>
      </pre> */}
      </div>
    </ErrorBoundary>
  );
};

export default FormQuestion;
