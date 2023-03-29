import { SurveyEdition, SURVEY_OPEN, SURVEY_PREVIEW } from "@devographics/core-models"
import { fetchSurvey } from "@devographics/core-models/server"
import { NextRequest, NextResponse } from "next/server"

function jsonErrorResponse(status: number, error: string) {
    return new Response(JSON.stringify({ error }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
/**
 * WORK IN PROGRESS moving save/start survey to Next 13 route handlers
 * @param req 
 * @param res 
 * @returns 
 * 
 * @example const survey = await getSurveyFromReq(req)
 * if (survey instanceof Response) {
 *      return response
 * }
 * // ... keep using survey
 */
export async function getSurveyFromReq(req: NextRequest) {
    // parameters
    const surveyId = req.nextUrl.searchParams.get("surveyId")
    if (!surveyId) {
        throw new Error("No survey slug, can't start survey")
    }
    const editionId = req.nextUrl.searchParams.get("editionId")
    if (!editionId) throw new Error("No survey editionId, can't start survey")
    let survey: SurveyEdition
    try {
        survey = await fetchSurvey(surveyId, editionId)
    } catch (err) {
        return jsonErrorResponse(
            404,
            `No survey found, surveyId: '${surveyId}', editionId: '${editionId}'`
        )
    }
    if (!survey.status || ![SURVEY_OPEN, SURVEY_PREVIEW].includes(survey.status)) {
        return jsonErrorResponse(
            400,
            `Survey '${editionId}' is neither open or in preview mode.`
        )
    }
    return survey
}