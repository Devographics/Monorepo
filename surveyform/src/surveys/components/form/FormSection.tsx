"use client";
import { useState } from "react";
import FormLayout from "./FormLayout";
import FormQuestion from "./FormQuestion";
import { captureException } from "@sentry/nextjs";
import { saveSurvey } from "~/surveys/components/page/services";
import { useRouter } from "next/navigation";

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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateCurrentValues = (path, value) => {
    setFormState((currentFormState) => {
      const { currentValues } = currentFormState;
      currentValues[path] = value;
      return { ...currentFormState, currentValues };
    });
  };

  const submitForm = async ({
    path,
    setButtonLoading,
  }: {
    path: string;
    setButtonLoading: any;
  }) => {
    setLoading(true);
    setButtonLoading(true);
    const res = await saveSurvey(edition, {
      id: response._id,
      data: formState.currentValues,
    });
    if (res.error) {
      console.error(res.error);
      captureException(res.error);
    }
    setLoading(false);
    setButtonLoading(false);
    router.push(path);
  };

  const stateStuff = {
    formState,
    setFormState,
    updateCurrentValues,
    loading,
    setLoading,
    submitForm,
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
