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
  const [isLoading, setIsLoading] = useState(false);
  const [prevLoading, setPrevLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);

  const updateCurrentValues = (path, value) => {
    setFormState((currentFormState) => {
      const { currentValues } = currentFormState;
      currentValues[path] = value;
      return { ...currentFormState, currentValues };
    });
  };

  const stateStuff = {
    formState,
    setFormState,
    updateCurrentValues,
    isLoading,
    setIsLoading,
    prevLoading,
    setPrevLoading,
    nextLoading,
    setNextLoading,
  };

  const response = mergeWithResponse(
    originalResponse,
    formState.currentValues,
    formState.deletedValues
  );

  // number is 1-based, so use 0-based index instead
  const sectionIndex = sectionNumber - 1;
  const previousSection = edition.sections[sectionIndex - 1];
  const nextSection = edition.sections[sectionIndex + 1];

  const formProps = {
    ...props,
    response,
    stateStuff,
    previousSection,
    nextSection,
  };

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
