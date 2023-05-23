"use client";
import { useState } from "react";
import FormLayout from "./FormLayout";
import FormQuestion from "./FormQuestion";
import { captureException } from "@sentry/nextjs";
import { saveResponse } from "~/components/page/services";
import { useRouter } from "next/navigation";
import isEmpty from "lodash/isEmpty";
import { FormContext } from "./FormContext";
import { ErrorBoundary } from "~/components/error";

const initFormState = (response) => ({
  currentValues: {},
  deletedValues: {},
});

const mergeWithResponse = (response, currentValues, deletedValues) => {
  return { ...response, ...currentValues };
};

export const FormSection = (props) => {
  const {
    edition,
    section,
    response: originalResponse,
    sectionNumber,
    readOnly,
  } = props;
  const [formState, setFormState] = useState(initFormState(originalResponse));
  const [loading, setLoading] = useState(false);
  const [currentTabindex, setCurrentTabindex] = useState<number | null>(null);
  const [currentFocusIndex, setCurrentFocusIndex] = useState<number | null>(
    null
  );
  const [errorResponse, setErrorResponse] = useState();

  const stateStuff = {
    formState,
    setFormState,
    loading,
    setLoading,
    currentTabindex,
    setCurrentTabindex,
    currentFocusIndex,
    setCurrentFocusIndex,
    errorResponse,
    setErrorResponse,
  };

  const router = useRouter();

  const updateCurrentValues = (newValues) => {
    setFormState((currentFormState) => {
      const { currentValues } = currentFormState;
      return {
        ...currentFormState,
        currentValues: { ...currentValues, ...newValues },
      };
    });
  };

  const submitForm = async ({
    path,
    beforeSubmitCallback,
    afterSubmitCallback,
  }: {
    path: string;
    beforeSubmitCallback: any;
    afterSubmitCallback: any;
  }) => {
    setErrorResponse(undefined);
    const { currentValues } = formState;
    if (readOnly || isEmpty(currentValues)) {
      // no data to submit, go straight to other page
      router.push(path);
    } else {
      // submit data
      setLoading(true);
      if (beforeSubmitCallback) {
        beforeSubmitCallback();
      }
      const data = {
        ...currentValues,
        lastSavedAt: new Date(),
      };
      // run action
      const res = await saveResponse({
        responseId: response._id,
        data,
      });
      setLoading(false);
      // callbacks include setting navLoading to false, etc.
      if (afterSubmitCallback) {
        afterSubmitCallback();
      }
      if (res.error) {
        console.error(res.error);
        captureException(res.error);
        setErrorResponse(res.error);
      } else {
        router.push(path);
      }
    }
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
    updateCurrentValues,
    submitForm,
  };

  return (
    <div>
      <FormContext.Provider value={formProps}>
        <FormLayout {...formProps}>
          {section.questions.map((question, index) => (
            <FormQuestion
              {...formProps}
              key={question.id}
              question={question}
              sectionNumber={sectionNumber}
              questionNumber={index + 1}
            />
          ))}
        </FormLayout>
      </FormContext.Provider>
    </div>
  );
};

export default FormSection;

/* 

ErrorBoundary triggers TS error, disable for now

<ErrorBoundary
  key={question.id}
  fallbackComponent={({ error }) => (
    <p>
      Could not load question {question.id} ({error?.message})
    </p>
  )}
>
  <FormQuestion
    {...formProps}
    key={question.id}
    question={question}
    sectionNumber={sectionNumber}
    questionNumber={index + 1}
  />
</ErrorBoundary> 

*/
