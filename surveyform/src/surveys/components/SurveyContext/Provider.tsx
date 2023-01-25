"use client";
import {
  SerializedSurveyDocument,
  SurveyDocument,
} from "@devographics/core-models/surveys/typings";
import React, { useContext } from "react";
import { parseSurvey } from "~/surveys/parser/parseSurvey";

const SurveyContext = React.createContext<SurveyDocument | undefined>(
  undefined
);

export const SurveyProvider = ({
  survey,
  children,
}: {
  survey: SerializedSurveyDocument;
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
export const useSurvey = (): SurveyDocument => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error("Called useSurvey before setting SurveyProvider context");
  }
  return context;
};
