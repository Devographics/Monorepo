import { SurveyMetadata } from "@devographics/types";
import { fetchSurveysListGraphQL } from "@devographics/core-models/server";

export let allSurveys: SurveyMetadata[] = [];

// load surveys if not yet loaded
export const loadOrGetSurveys = async (
  options: { forceReload?: boolean } = { forceReload: false }
) => {
  const { forceReload } = options;

  if (forceReload || allSurveys.length === 0) {
    allSurveys = await fetchSurveysListGraphQL({
      apiUrl: process.env.DATA_API_URL,
    });
  }
  return allSurveys;
};
