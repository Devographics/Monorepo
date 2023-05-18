import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";
import { getUsersCollection } from "@devographics/mongo";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromToken, TOKEN_NAME } from "~/account/user/api";
import { UserDocument } from "~/core/models/user";
import { throwError, ServerError } from "~/lib/validation";

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
  const Users = await getUsersCollection();
  const user = await Users.findOne({ _id });
  // const user = await UserMongooseModel.findOne({ _id });
  return user;
}

/**
 * Experimental: a helper function to be called by Route Handlers
 * Will either return an error response or the value we want
 * (similarly to a Connect middleware)
 */
export async function tryGetCurrentUser(
  req: NextRequest
): Promise<UserDocument | NextResponse> {
  const userId = await getUserIdFromReq(req);
  if (!userId) {
    throwError({
      id: "authentication",
      message: "Not authenticated",
      status: 401,
    });
  }
  const Users = await getUsersCollection<UserDocument>();
  const currentUser = await Users.findOne(
    { _id: userId },
    { projection: { isAdmin: true, createdAt: true } }
  );
  if (!currentUser) {
    return NextResponse.json(
      { error: "User do not exist anymore" },
      { status: 401 }
    );
  }
  return currentUser;
}
