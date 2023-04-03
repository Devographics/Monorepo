import { SurveyEdition, SURVEY_OPEN, SURVEY_PREVIEW } from "@devographics/core-models"
import { fetchSurvey } from "@devographics/core-models/server"
import { NextRequest } from "next/server"
import { getSessionFromReq } from "~/account/user/api";
import { UserMongooseModel } from "~/core/models/user.server";

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

export async function getUserFromReq(req: Request | NextRequest) {
    const session = await getSessionFromReq(req);
    if (!session?._id) return null
    // Refetch the user from db in order to get the freshest data
    // NOTE: State of app is using "string" _id for legacy reason,
    // be careful during dev that if "users" were seeded with Vulcan Next, the _id might ObjectId, thus failing connection
    // In this case, just drop vulcanusers, the admin user will be recreated during seed
    const user = await UserMongooseModel.findOne({ _id: session._id }); //await UserConnector.findOneById(session._id);
    return user;

}