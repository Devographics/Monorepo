/**
 * Fetchers optimized for Next.js
 */
import { notFound } from "next/navigation";

import { fetchEditionMetadata } from "@devographics/fetch";

const surveyParamsTable = {
  "state-of-css": {
    2019: { surveyId: "state_of_css", editionId: "css2019" },
    2020: { surveyId: "state_of_css", editionId: "css2020" },
    2021: { surveyId: "state_of_css", editionId: "css2021" },
    2022: { surveyId: "state_of_css", editionId: "css2022" },
    2023: { surveyId: "state_of_css", editionId: "css2023" },
  },
  "state-of-graphql": {
    2022: { surveyId: "state_of_css", editionId: "graphql2022" },
  },
  "state-of-js": {
    2016: { surveyId: "state_of_js", editionId: "js2016" },
    2017: { surveyId: "state_of_js", editionId: "js2017" },
    2018: { surveyId: "state_of_js", editionId: "js2018" },
    2019: { surveyId: "state_of_js", editionId: "js2019" },
    2020: { surveyId: "state_of_js", editionId: "js2020" },
    2021: { surveyId: "state_of_js", editionId: "js2021" },
    2022: { surveyId: "state_of_js", editionId: "js2022" },
    2023: { surveyId: "state_of_js", editionId: "js2023" },
  },
};

/**
 * Use in metadata
 * Prefer "mustGetSurvey" in pages
 * @param params
 * @returns
 */
export async function getSurveyEditionFromUrl(params: {
  slug: string;
  year: string;
}) {
  try {
    const { slug, year } = params;
    const { surveyId, editionId } = surveyParamsTable[slug][year];
    const survey = await fetchEditionMetadata({ surveyId, editionId });
    return survey;
  } catch (err) {
    console.error(
      "Could not load survey",
      params.slug,
      params.year,
      "error:",
      err
    );
    return null;
  }
}

export async function mustGetSurveyEdition(params: {
  slug: string;
  year: string;
}) {
  const survey = await getSurveyEditionFromUrl(params);
  if (!survey) {
    notFound();
  }
  return survey;
}
