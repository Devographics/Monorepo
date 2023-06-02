"use client";
import { ResponseDocument } from "@devographics/types";
import React, { createContext, useContext, useState } from "react";

const ResponseContext = createContext<
  | {
      response: ResponseDocument;
      /**
       * TODO: this is a palliative to force updating the value after we save the response
       * Otherwise, "router.push" will soft navigate => it won't refetch the response
       * @see https://github.com/vercel/next.js/issues/49387
       */
      updateResponseFromClient: (response: ResponseDocument) => void;
    }
  | undefined
>(undefined);

export const ResponseProvider = ({
  response,
  children,
}: {
  // TODO: should be the full response fetched server-side
  response: ResponseDocument;
  children: React.ReactNode;
}) => {
  /**
   * TODO: this is a palliative to force updating the value after we save the response
   * Otherwise, "router.push" will soft navigate => it won't refetch the response
   * @see https://github.com/vercel/next.js/issues/49450
   * @see https://github.com/vercel/next.js/issues/49387
   */
  const [responseState, setResponseState] =
    useState<ResponseDocument>(response);
  return (
    <ResponseContext.Provider
      value={{
        response: responseState,
        updateResponseFromClient: (r) => {
          setResponseState(r);
        },
      }}
    >
      {children}
    </ResponseContext.Provider>
  );
};

export const useResponse = () => {
  const context = useContext(ResponseContext);
  if (!context) {
    throw new Error(
      "Called useResponseId before setting ResponseIdProvider context"
    );
  }
  return context;
};

export const useResponseId = () => {
  return useResponse().response._id;
};
