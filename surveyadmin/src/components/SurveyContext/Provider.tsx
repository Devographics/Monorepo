"use client";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { createContext, ReactNode, useContext } from "react";

interface EditionContextType {
  edition: EditionMetadata;
  survey: SurveyMetadata;
}
const EditionContext = createContext<EditionContextType | undefined>(undefined);

export const EditionProvider = ({
  edition,
  survey,
  children,
}: EditionContextType & {
  children: ReactNode;
}) => {
  return (
    <EditionContext.Provider
      value={{
        edition,
        survey,
      }}
    >
      {children}
    </EditionContext.Provider>
  );
};

/**
 * @returns The survey definition WITHOUT REACT COMPONENTS
 */
export const useEdition = (): EditionContextType => {
  const context = useContext(EditionContext);
  if (!context) {
    throw new Error("Called useEdition before setting EditionProvider context");
  }
  return context;
};
