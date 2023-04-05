"use client";
import { ResponseDocument } from "@devographics/core-models";
import React, { createContext, useContext } from "react";

const ResponseContext = createContext<ResponseDocument | undefined>(undefined);

export const ResponseProvider = ({
  response,
  children,
}: {
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
      "Called useResponse before setting ResponseProvider context"
    );
  }
  return context;
};
