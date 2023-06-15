"use client";
import { useState, useEffect } from "react";
import FormLayout from "./FormLayout";
import FormQuestion from "./FormQuestion";
import { captureException } from "@sentry/nextjs";
import { saveResponse } from "~/components/page/services";
import { useRouter } from "next/navigation";
import isEmpty from "lodash/isEmpty";
import { FormContext } from "./FormContext";
import { ErrorBoundary } from "~/components/error";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { useResponse } from "../ResponseContext/ResponseProvider";
import { Edition, ResponseDocument, Section } from "@devographics/types";
import { Message } from "./FormMessages";

const initFormState = (response) => ({
  currentValues: {},
  deletedValues: {},
});

const mergeWithResponse = (
  response: ResponseDocument,
  currentValues: Partial<ResponseDocument>,
  deletedValues
) => {
  return { ...response, ...currentValues };
};

export const FormSection = (
  props: {
    edition: Edition;
    section: Section;
    // in outline mode there is no response
    response?: ResponseDocument;
    sectionNumber: number;
    readOnly?: boolean;
  } & any /** TODO: those are form input props? */
) => {
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [itemPositions, setItemPositions] = useState([]);
  const [reactToChanges, setReactToChanges] = useState(true);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const { locale } = useLocaleContext();

  const { updateResponseFromClient } = useResponse();

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
    messages,
    setMessages,
    scrollPosition,
    setScrollPosition,
    itemPositions,
    setItemPositions,
    reactToChanges,
    setReactToChanges,
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

  /**
   * Called when we navigate from a page to another, saves the current response
   */
  const submitForm = async ({
    path,
    beforeSubmitCallback,
    afterSubmitCallback,
  }: {
    /**
     * Next page path
     */
    path: string;
    beforeSubmitCallback: any;
    afterSubmitCallback: any;
  }) => {
    if (!response) {
      throw new Error(
        "Can't submit for if there is no response (read-only or outline mode)"
      );
    }
    setErrorResponse(undefined);
    const { currentValues } = formState;
    if (readOnly || isEmpty(currentValues)) {
      // no data to submit, go straight to other page with soft navigation
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
        locale: locale.id,
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
        const { id, message, status } = res.error;
        addMessage({
          type: "error",
          headerId: id,
          extraInfo: status,
          body: message,
        });
        return;
      }
      // TODO: @see https://github.com/vercel/next.js/issues/49387#issuecomment-1564539515
      // TODO: even the client update doesn't seem to work, we have stale response when going back
      //console.log("Update response", res);
      updateResponseFromClient(res.data!);
      router.push(path);
      // window.location.pathname = path;
    }
  };

  // keep response undefined if it was not provided (read-only mode)
  const response =
    originalResponse &&
    mergeWithResponse(
      originalResponse,
      formState.currentValues,
      formState.deletedValues
    );

  // number is 1-based, so use 0-based index instead
  const sectionIndex = sectionNumber - 1;
  const previousSection = edition.sections[sectionIndex - 1];
  const nextSection = edition.sections[sectionIndex + 1];

  const addMessage = (message: Message) => {
    setMessages((messages) => [...messages, message]);
  };

  const formProps = {
    ...props,
    response,
    stateStuff,
    previousSection,
    nextSection,
    updateCurrentValues,
    submitForm,
    addMessage,
  };

  return (
    <div>
      <FormContext.Provider value={formProps}>
        <FormLayout {...formProps}>
          {section.questions.map((question, index) => (
            // TODO: the boundary "render" function has some where typings
            // @ts-ignore
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
          ))}
        </FormLayout>
      </FormContext.Provider>
    </div>
  );
};

export default FormSection;
