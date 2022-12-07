"use client";
import { ResponseDocument } from "@devographics/core-models";
import React, { useContext } from "react";

const ResponseContext = React.createContext<ResponseDocument | undefined>(
  undefined
);

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

export const useResponse = () => {
  const context = useContext(ResponseContext);
  if (!context) {
    throw new Error(
      "Called useResponse before setting ResponseProvider context"
    );
  }
  return context;
};
