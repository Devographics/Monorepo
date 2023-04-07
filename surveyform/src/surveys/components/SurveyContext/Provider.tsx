"use client";
import { SurveyEdition } from "@devographics/core-models";
import { createContext, ReactNode, useContext } from "react";
import { parseSurvey } from "~/surveys/parser/parseSurvey";

const SurveyContext = createContext<SurveyEdition | undefined>(undefined);

export const SurveyProvider = ({
  survey,
  children,
}: {
  survey: SurveyEdition;
  children: ReactNode;
}) => {
  // @ts-ignore
  const parsedSurvey = parseSurvey(survey);
  return (
    <SurveyContext.Provider value={parsedSurvey}>
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
