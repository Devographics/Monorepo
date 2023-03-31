/**
 * Fetchers optimized for Next.js 
 */
import { notFound } from "next/navigation";

import { fetchSurvey, fetchSurveyDescriptionFromUrl } from "@devographics/core-models/server";

/**
 * Use in metadata
 * Prefer "mustGetSurvey" in pages
 * @param params 
 * @returns 
 */
export async function getSurveyFromUrl(params: { slug: string, year: string }) {
    try {
        const surveyDesc = await fetchSurveyDescriptionFromUrl(params.slug, params.year);
        const survey = await fetchSurvey(
            surveyDesc.surveyId,
            surveyDesc.editionId
        );
        return survey
    } catch (err) {
        console.error("Could not load survey", params.slug, params.year, "error:", err);
        return null
    }

}

export async function mustGetSurvey(params: { slug: string; year: string }) {
    const survey = await getSurveyFromUrl(params);
    if (!survey) {
        notFound();
    }
    return survey;
}