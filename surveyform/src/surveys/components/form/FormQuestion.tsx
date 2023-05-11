"use client";
import { addComponentToQuestionObject } from "~/responses/customComponents";
import { parseOptions } from "~/responses/helpers";

const getOnChangeHandler = ({
  edition,
  section,
  question,
  response,
  stateStuff,
}) => {
  const { updateCurrentValues, setFormState } = stateStuff;
  return (event) => {
    const path = question.formPaths.response;
    const value = event.target.value;
    updateCurrentValues(path, value);
  };
};

export const FormQuestion = (props) => {
  const { edition, section, response, question, stateStuff } = props;
  const { setFormState } = stateStuff;
  const qWithComponent = addComponentToQuestionObject(question);
  const Component = qWithComponent.input;
  const value = response?.[question.formPaths.response];
  const options = parseOptions(question, question.options);
  const componentProperties = {
    inputProperties: {
      options,
      value,
      onChange: getOnChangeHandler(props),
    },
    itemProperties: {
      questionId: question.id,
      questionObject: question,
      label: question.formPaths.response,
    },
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
