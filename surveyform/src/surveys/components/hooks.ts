"use client"
import { useResponse } from "./ResponseContext/ResponseProvider";
import { useSection } from "./SectionContext/SectionProvider";
import { useSurvey } from "./SurveyContext/Provider";

export const useSurveyParams = (): {
  slug: string;
  year: string,
  // TODO: use those id instead of slug/year whenever possible
  // (= all the time except when building actual URL)
  surveyEditionId: string, surveyContextId: string
} => {
  const survey = useSurvey()
  if (!survey) {
    throw new Error("Called useSurveyParams outside of survey page")
  }
  // TODO: we will need useParams instead, it's not yet released (07/12/2022)
  const slug = survey.surveyContextId.replaceAll("_", "-")
  const year = survey.year + ""
  return { slug, year, surveyContextId: survey.surveyContextId, surveyEditionId: survey.surveyEditionId };
};


export const useSurveyResponseSectionParams = (): {
  slug: string;
  year: string;
  responseId: string | "read-only";
  sectionNumber?: number;
} => {
  // TODO: we will need useParams instead, it's not yet released (07/12/2022)
  const rootParams = useSurveyParams(); // slug and year
  const { id: responseId } = useResponse()
  const sectionNumber = useSection()
  return {
    ...rootParams,
    responseId: responseId as string,
    sectionNumber,
  };
};

export const useSurveyResponseParams = (): {
  slug: string;
  year: string;
  responseId: string | "read-only";
} => {
  // TODO: we will need useParams instead, it's not yet released (07/12/2022)
  const rootParams = useSurveyParams(); // slug and year
  const { id: responseId } = useResponse()
  return {
    ...rootParams,
    responseId: responseId as string,
  };
};
