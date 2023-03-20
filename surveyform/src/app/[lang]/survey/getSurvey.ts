import { fetchSurvey, fetchSurveyDescriptionFromUrl } from "@devographics/core-models/server";

export async function getSurveyFromUrl(slug: string, year: string) {
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