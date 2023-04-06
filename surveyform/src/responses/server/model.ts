/**
 * All relevant methods based on declarative schema
 */
import { ResponseDocument } from "@devographics/core-models";
import { UserDocument } from "~/core/models/user";
import { statuses } from "~/surveys/constants";
import { fetchSurveyFromId } from "@devographics/core-models/server";
import { isAdmin, owns } from "@devographics/permissions";


/**
 * TODO: pass the survey as argument directly?
 */
export const canModifyResponse = async (response: ResponseDocument, user: UserDocument) => {
    if (!response || !user) {
        return false;
    }
    if (!response.surveySlug) {
        throw new Error(`Cannot modify response ${response._id}, it has no surveySlug`)
    }
    const survey = await fetchSurveyFromId(response.surveySlug);
    // admins can modify any survey; users can modify their own surveys
    const isAdminOrOwner = isAdmin(user) || owns(user, response)

    switch (survey.status) {
        case statuses.preview:
            return isAdminOrOwner;
        case statuses.open:
            return isAdminOrOwner;
        case statuses.closed:
            // nobody can modify closed survey
            return false;
        case statuses.hidden:
            return isAdminOrOwner;
        default:
            throw new Error(`Unknown survey status ${survey.status}`);
    }
};