import { SurveyMetadata } from "@devographics/types";
import { getFromCache, fetchGraphQLApi } from "@devographics/fetch";
import { getSurveysQuery } from "./queries";

export let allSurveys: SurveyMetadata[] = [];

// load surveys if not yet loaded
export const loadOrGetSurveys = async (
  options: { forceReload?: boolean } = { forceReload: false }
) => {
  const { forceReload } = options;

  if (forceReload || allSurveys.length === 0) {
    allSurveys = await fetchSurveysMetadata();
  }
  return allSurveys;
};

/**
 * Fetch metadata for all surveys
 * @returns
 */
export const fetchSurveysMetadata = async (options?: {
  calledFrom?: string;
}): Promise<Array<SurveyMetadata>> => {
  const result = await fetchGraphQLApi({ query: getSurveysQuery() });
  return result._metadata.surveys as SurveyMetadata[];
};
