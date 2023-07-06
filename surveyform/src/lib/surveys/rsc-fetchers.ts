import { cache } from "react";
import { serverConfig } from "~/config/server";
import { fetchSurveysMetadata } from "~/lib/api/fetch";

export const rscFetchSurveysMetadata = cache(async () => {
  const surveys = await fetchSurveysMetadata({ calledFrom: __filename });
  let filteredSurveys = surveys;
  if (serverConfig().isProd && !serverConfig()?.isTest) {
    filteredSurveys = surveys.filter((s) => s.id !== "demo_survey");
  }
  filteredSurveys = filteredSurveys.map((survey) => ({
    ...survey,
    editions: survey.editions.filter(
      (edition) => edition?.sections?.length > 0
    ),
  }));
  return filteredSurveys;
});
