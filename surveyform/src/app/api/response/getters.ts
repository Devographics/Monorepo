import {
  SurveyEdition,
  SURVEY_OPEN,
  SURVEY_PREVIEW,
} from "@devographics/core-models";
import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";
import { NextRequest, NextResponse } from "next/server";
import {
  getSessionFromReq,
  getSessionFromToken,
  TOKEN_NAME,
} from "~/account/user/api";
import { UserMongooseModel } from "~/core/models/user.server";

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
export async function getEditionFromReq(req: NextRequest) {
  // parameters
  const surveyId = req.nextUrl.searchParams.get("surveyId");
  if (!surveyId) {
    return NextResponse.json({
      error: "No survey id, can't start survey",
    });
  }
  const editionId = req.nextUrl.searchParams.get("editionId");
  if (!editionId) throw new Error("No survey editionId, can't start survey");
  let edition: EditionMetadata;
  try {
    edition = await fetchEditionMetadataSurveyForm({ surveyId, editionId });
  } catch (err) {
    return NextResponse.json(
      {
        error: `No survey found, surveyId: '${surveyId}', editionId: '${editionId}'`,
      },
      { status: 404 }
    );
  }
  if (!edition.status || [SurveyStatusEnum.CLOSED].includes(edition.status)) {
    return NextResponse.json(
      { error: `Survey '${editionId}' is closed.` },
      { status: 400 }
    );
  }
  return edition;
}

export async function getUserIdFromReq(req: NextRequest) {
  const token = req.cookies.get(TOKEN_NAME)?.value;
  if (!token) return null;
  const session = await getSessionFromToken(token);
  //token as string)
  if (!session?._id) return null;
  return session?._id;
}
/**
 * Get user, for authentication purpose
 * /!\ If you need to send back the user in the response,
 * instead get use "getUserIdFromReq" and write your own database call
 * @param req
 * @returns
 */
export async function getUserFromReq(req: NextRequest) {
  const _id = getUserIdFromReq(req);
  if (!_id) return null;
  // Refetch the user from db in order to get the freshest data
  // NOTE: State of app is using "string" _id for legacy reason,
  // be careful during dev that if "users" were seeded with Vulcan Next, the _id might ObjectId, thus failing connection
  // In this case, just drop vulcanusers, the admin user will be recreated during seed
  const user = await UserMongooseModel.findOne({ _id });
  return user;
}
