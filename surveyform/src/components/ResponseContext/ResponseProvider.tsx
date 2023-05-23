"use client";
import type { ResponseDocument } from "@devographics/types";
import React, { createContext, useContext } from "react";

const ResponseIdContext = createContext<string | undefined>(undefined);

export const ResponseProvider = ({
  responseId,
  children,
}: {
  // TODO: should be the full response fetched server-side
  responseId: string;
  children: React.ReactNode;
}) => {
  return (
    <ResponseIdContext.Provider value={responseId}>
      {children}
    </ResponseIdContext.Provider>
  );
};

/**
 * Response id can be "read-only"
 * @returns
 */
export const useResponseId = () => {
  const context = useContext(ResponseIdContext);
  if (!context) {
    throw new Error(
      "Called useResponseId before setting ResponseIdProvider context"
    );
  }
  return context;
};
