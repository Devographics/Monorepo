"use client";
import { SurveyEdition } from "@devographics/core-models/surveys/typings";
import React, { useContext } from "react";
import { parseSurvey } from "~/surveys/parser/parseSurvey";

const SurveyContext = React.createContext<SurveyEdition | undefined>(undefined);

export const SurveyProvider = ({
  survey,
  children,
}: {
  survey: SurveyEdition;
  children: React.ReactNode;
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
export const useSurvey = (): SurveyEdition => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error("Called useSurvey before setting SurveyProvider context");
  }
  return context;
};
