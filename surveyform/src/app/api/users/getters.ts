import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";
import { getUsersCollection } from "@devographics/mongo";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromToken, TOKEN_NAME } from "~/account/user/api";
import { UserDocument } from "~/lib/users/model";
import { ServerError } from "~/lib/validation";

export async function getUserIdFromReq(req: NextRequest) {
  const token = req.cookies.get(TOKEN_NAME)?.value;
  if (!token) return null;
  const session = await getSessionFromToken(token);
  //token as string)
  if (!session?._id) return null;
  return session?._id;
}

/**
 * Experimental: a helper function to be called by Route Handlers
 * Will either throw an error or return the value we want
 */
export async function tryGetCurrentUser(
  req: NextRequest
): Promise<UserDocument | NextResponse> {
  const userId = await getUserIdFromReq(req);
  if (!userId) {
    throw new ServerError({
      id: "not_authenticated",
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
    throw new ServerError({
      id: "user_not_found",
      message: "Could not find current user",
      status: 401,
    });
  }
  return currentUser;
}
