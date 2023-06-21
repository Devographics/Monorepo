/**
 * Fetchers optimized for Next.js
 */
import { notFound } from "next/navigation";
import { fetchEditionMetadata } from "~/lib/api/fetch";
import { surveyParamsLookup } from "~/lib/surveys/data";

/**
 * Use in metadata
 * Prefer "mustGetSurvey" in pages
 * @param params
 * @returns
 */
export async function rscGetSurveyEditionFromUrl(params: {
  slug: string;
  year: string;
}) {
  try {
    const { slug, year } = params;
    const { surveyId, editionId } = surveyParamsLookup({
      surveySlug: slug,
      editionSlug: year,
    });
    const edition = await fetchEditionMetadata({
      surveyId,
      editionId,
      calledFrom: "getSurveyEditionFromUrl",
    });
    return edition;
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

export async function rscMustGetSurveyEditionFromUrl(params: {
  slug: string;
  year: string;
}) {
  const edition = await rscGetSurveyEditionFromUrl(params);
  if (!edition) {
    notFound();
  }
  return edition;
}
