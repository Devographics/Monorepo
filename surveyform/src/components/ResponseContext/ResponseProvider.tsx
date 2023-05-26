"use client";
import { ResponseDocument } from "@devographics/types";
import React, { createContext, useContext } from "react";

const ResponseContext = createContext<ResponseDocument | undefined>(undefined);

export const ResponseProvider = ({
  response,
  children,
}: {
  // TODO: should be the full response fetched server-side
  response: ResponseDocument;
  children: React.ReactNode;
}) => {
  return (
    <ResponseContext.Provider value={response}>
      {children}
    </ResponseContext.Provider>
  );
};

/**
 * Response id can be "read-only"
 * @returns
 */
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
  return useResponse()._id;
};
