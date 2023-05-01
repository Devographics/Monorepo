/**
 * Fetchers optimized for Next.js
 */
import { notFound } from "next/navigation";
import { surveyParamsTable } from "~/surveys/helpers";
import { fetchEditionMetadata } from "@devographics/fetch";

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
