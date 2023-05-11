"use client";
import { addComponentToQuestionObject } from "~/responses/customComponents";
import { parseOptions } from "~/responses/helpers";

export const FormQuestion = (props) => {
  const { edition, section, response, question } = props;
  const qWithComponent = addComponentToQuestionObject(question);
  const Component = qWithComponent.input;
  const value = response?.[question.formPaths.response];
  const options = parseOptions(question, question.options);
  const componentProperties = {
    inputProperties: {
      options,
      value,
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
