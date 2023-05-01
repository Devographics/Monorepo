"use client";
import { SurveyEdition } from "@devographics/core-models";
import { createContext, ReactNode, useContext } from "react";
import { parseEdition } from "~/surveys/parser/parseSurvey";

const SurveyContext = createContext<SurveyEdition | undefined>(undefined);

export const SurveyProvider = ({
  edition,
  children,
}: {
  edition: SurveyEdition;
  children: ReactNode;
}) => {
  // @ts-ignore
  const parsedEdition = parseEdition(edition);
  return (
    <SurveyContext.Provider value={parsedEdition}>
      {children}
    </SurveyContext.Provider>
  );
};

/**
 *
 * @returns The survey definition WITHOUT REACT COMPONENTS
 */
export const useSurvey = (dontThrow?: boolean): SurveyEdition => {
  const context = useContext(SurveyContext);
  if (!context) {
    // TODO: a hack to support calling in the login form
    if (dontThrow) return null as unknown as SurveyEdition;
    throw new Error("Called useSurvey before setting SurveyProvider context");
  }
  return context;
};
