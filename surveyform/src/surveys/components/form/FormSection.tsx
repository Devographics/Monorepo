"use client";
import { useState } from "react";
import FormLayout from "./FormLayout";
import FormQuestion from "./FormQuestion";

const initFormState = (response) => ({
  currentValues: {},
  deletedValues: {},
});

const mergeWithResponse = (response, currentValues, deletedValues) => {
  return { ...response, ...currentValues };
};

export const FormSection = (props) => {
  const { edition, section, response: originalResponse, sectionNumber } = props;
  const [formState, setFormState] = useState(initFormState(originalResponse));

  const updateCurrentValues = (path, value) => {
    setFormState((currentFormState) => {
      const { currentValues } = currentFormState;
      currentValues[path] = value;
      return { ...currentFormState, currentValues };
    });
  };

  const stateStuff = { formState, setFormState, updateCurrentValues };

  const response = mergeWithResponse(
    originalResponse,
    formState.currentValues,
    formState.deletedValues
  );

  const formProps = { ...props, response, stateStuff };

  return (
    <div>
      <FormLayout {...formProps}>
        {section.questions.map((question) => (
          <FormQuestion {...formProps} key={question.id} question={question} />
        ))}
      </FormLayout>
    </div>
  );
};

export default FormSection;
