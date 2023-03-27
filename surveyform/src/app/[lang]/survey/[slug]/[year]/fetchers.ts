/**
 * Fetchers optimized for Next.js 
 */
import { notFound } from "next/navigation";

import { fetchSurvey, fetchSurveyDescriptionFromUrl } from "@devographics/core-models/server";

async function getSurveyFromUrl(slug: string, year: string) {
    try {
        const surveyDesc = await fetchSurveyDescriptionFromUrl(slug, year);
        const survey = await fetchSurvey(
            surveyDesc.surveyId,
            surveyDesc.editionId
        );
        return survey
    } catch (err) {
        console.error("Could not load survey", slug, year, "error:", err);
        return null
    }

}

export async function mustGetSurvey(params: { slug: string; year: string }) {
    const { slug, year } = params;
    const survey = await getSurveyFromUrl(slug, year);
    if (!survey) {
        notFound();
    }
    return survey;
}