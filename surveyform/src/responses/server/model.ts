/**
 * All relevant methods based on declarative schema
 */
import { ResponseDocument } from "@devographics/core-models";
import { UserDocument } from "~/core/models/user";
import { statuses } from "~/surveys/constants";
import { isAdmin, owns } from "@devographics/permissions";
import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";

/**
 * TODO: pass the survey as argument directly?
 */
export const canModifyResponse = async (
  response: ResponseDocument,
  user: UserDocument
) => {
  if (!response || !user) {
    return false;
  }
  const { surveyId, editionId } = response;
  const survey = await fetchEditionMetadataSurveyForm({ surveyId, editionId });
  // admins can modify any survey; users can modify their own surveys
  const isAdminOrOwner = isAdmin(user) || owns(user, response);

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
