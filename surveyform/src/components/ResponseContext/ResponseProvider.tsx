"use client";
import { ResponseDocument } from "@devographics/types";
import React, { createContext, useContext, useState } from "react";

interface ResponseContextType {
  response: ResponseDocument | null;
  /**
   * TODO: this is a palliative to force updating the value after we save the response
   * Otherwise, "router.push" will soft navigate => it won't refetch the response
   * @see https://github.com/vercel/next.js/issues/49387
   */
  updateResponseFromClient: (response: ResponseDocument) => void;
}
const ResponseContext = createContext<ResponseContextType | undefined>(
  undefined
);

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
  //console.log("rerendering context", responseState);
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

export const useResponse = (): ResponseContextType => {
  const context = useContext(ResponseContext);
  if (!context) {
    return {
      response: null,
      updateResponseFromClient: () => {
        throw new Error(
          "Called updateResponseFromClient without verifying if there was a response"
        );
      },
    };
    /*
    throw new Error(
      "Called useResponse before setting ResponseIdProvider context"
    );
    */
  }
  return { ...context };
};
