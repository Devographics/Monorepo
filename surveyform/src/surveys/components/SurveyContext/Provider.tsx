"use client";
import { EditionMetadata } from "@devographics/types";
import { createContext, ReactNode, useContext } from "react";
import { parseEdition } from "~/surveys/parser/parseSurvey";

const EditionContext = createContext<EditionMetadata | undefined>(undefined);

export const SurveyProvider = ({
  edition,
  children,
}: {
  edition: EditionMetadata;
  children: ReactNode;
}) => {
  // @ts-ignore
  const parsedEdition = parseEdition(edition);
  return (
    <EditionContext.Provider value={parsedEdition}>
      {children}
    </EditionContext.Provider>
  );
};

/**
 *
 * @returns The survey definition WITHOUT REACT COMPONENTS
 */
export const useEdition = (dontThrow?: boolean): EditionMetadata => {
  const context = useContext(EditionContext);
  if (!context) {
    // TODO: a hack to support calling in the login form
    if (dontThrow) return null as unknown as EditionMetadata;
    throw new Error("Called useSurvey before setting SurveyProvider context");
  }
  return context;
};
