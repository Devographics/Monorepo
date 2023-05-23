"use client";
import { useResponseId } from "./ResponseContext/ResponseProvider";
import { useSection } from "./SectionContext/SectionProvider";
import { useEdition } from "./SurveyContext/Provider";

interface SurveyParams {
  /** state-of-js */
  surveySlug: string;
  /** usually the year: 2022 */
  editionSlug: string;
  // TODO: use those id instead of slug/year whenever possible
  // (= all the time except when building actual URL)
  editionId: string;
  surveyId: string;
}

export const useSurveyParams = (dontThrow?: boolean): SurveyParams => {
  const result = useEdition(dontThrow);
  const { edition, surveySlug, editionSlug } = result;
  if (!edition) {
    // Needed for components that use the survey if its there, like the login form
    if (dontThrow) {
      return { editionId: "", surveyId: "", surveySlug: "", editionSlug: "" };
    }
    throw new Error("Called useSurveyParams outside of survey page");
  }
  // TODO: we will need useParams instead, it's not yet released (07/12/2022)
  return {
    surveySlug,
    editionSlug,
    surveyId: edition.survey.id,
    editionId: edition.id,
  };
};

export const useSurveyResponseSectionParams = (): SurveyParams & {
  responseId: string | "read-only";
  sectionNumber?: number;
} => {
  // TODO: we will need useParams instead, it's not yet released (07/12/2022)
  const rootParams = useSurveyParams(); // slug and year
  const responseId = useResponseId();
  const sectionNumber = useSection();
  return {
    ...rootParams,
    responseId: responseId as string,
    sectionNumber,
  };
};

export const useSurveyResponseParams = (): SurveyParams & {
  responseId: string | "read-only";
} => {
  // TODO: we will need useParams instead, it's not yet released (07/12/2022)
  const rootParams = useSurveyParams(); // slug and year
  const responseId = useResponseId();
  return {
    ...rootParams,
    responseId: responseId as string,
  };
};
