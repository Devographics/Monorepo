/**
 * Fetchers optimized for Next.js
 */
import { notFound } from "next/navigation";
import { fetchEditionMetadata } from "@devographics/fetch";
import { surveyParamsLookup } from "~/lib/surveys/data";
import { rscFetchSurveysMetadata } from "~/lib/surveys/rsc-fetchers";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";

/**
 * Use in metadata
 * Prefer "mustGetSurvey" in pages
 */
export async function rscGetSurveyEditionFromUrl(params: {
  /** state-of-css */
  slug: string;
  /** 2022 */
  year: string;
}) {
  try {
    const { slug, year } = params;
    const { surveyId, editionId } = surveyParamsLookup({
      surveySlug: slug,
      editionSlug: year,
    });
    const result = await fetchEditionMetadata({
      surveyId,
      editionId,
      calledFrom: "rscGetSurveyEditionFromUrl",
    });
    return result;
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

export async function rscGetEditionsMetadata({ removeHidden }: {
  /** Remove hidden and preview survey 
   * (so they are not statically rendered, they may not be valid yet) */
  removeHidden?: boolean
} = {}) {
  const surveys = (await rscFetchSurveysMetadata())?.data || [];
  const editions = surveys.map((s) => s.editions).flat();
  if (removeHidden) {
    return editions.filter(e => [SurveyStatusEnum.CLOSED, SurveyStatusEnum.OPEN].includes(e.status))
  }
  return editions
}

// TODO: can't find the existing helper that does that?
export const getEditionParams = (e: EditionMetadata) => ({
  slug: e.surveyId.replaceAll("_", "-"),
  year: String(e.year),
})