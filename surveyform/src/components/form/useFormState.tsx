import { useState, useEffect } from "react";
import { captureException } from "@sentry/nextjs";
import { saveResponse } from "~/components/page/services";
import { useRouter } from "next/navigation";
import isEmpty from "lodash/isEmpty";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { useResponse } from "../ResponseContext/ResponseProvider";
import { Message } from "./FormMessages";
import { useMessagesContext } from "../common/UserMessagesContext";
import { ResponseDocument } from "@devographics/types";

interface ClientData {
  [key: string]: any;
  lastSavedAt: Date;
  locale: string;
  finishedAt?: Date;
}

const initFormState = () => ({
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

export const useFormState = ({
  originalResponse,
  readOnly,
}: {
  originalResponse?: ResponseDocument;
  readOnly?: boolean;
}) => {
  const [formState, setFormState] = useState(initFormState());
  const [loading, setLoading] = useState(false);
  const [currentTabindex, setCurrentTabindex] = useState<number | null>(null);
  const [currentFocusIndex, setCurrentFocusIndex] = useState<number | null>(
    null
  );
  const [errorResponse, setErrorResponse] = useState();
  const [messages, setMessages] = useState<Message[]>([]);
  const [itemPositions, setItemPositions] = useState([]);
  const [reactToChanges, setReactToChanges] = useState(false);

  const { addMessage } = useMessagesContext();

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
    isFinished = false,
  }: {
    /**
     * Next page path
     */
    path: string;
    beforeSubmitCallback: any;
    afterSubmitCallback: any;
    isFinished: boolean;
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
      const data: ClientData = {
        ...currentValues,
        lastSavedAt: new Date(),
        locale: locale.id,
      };
      if (isFinished) {
        data.finishedAt = new Date();
      }
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
          debugInfo: {
            location: typeof window !== "undefined" && window?.location?.href,
            timestamp: new Date(),
            data,
            error: res.error,
          },
        });
        return;
      }
      // TODO: @see https://github.com/vercel/next.js/issues/49387#issuecomment-1564539515
      // TODO: even the client update doesn't seem to work, we have stale response when going back
      //console.log("Update response", res);
      updateResponseFromClient(res.data!);
      router.push(path);
      console.log("saved");
      addMessage({ type: "success", bodyId: "success.data_saved.description" });
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

  return {
    stateStuff,
    updateCurrentValues,
    submitForm,
    response,
  } as const;
};

export type FormState = ReturnType<typeof useFormState>;
