import { getUsersCollection } from "@devographics/mongo";
import { NextRequest } from "next/server";
import { getSessionFromToken, TOKEN_NAME } from "~/account/user/api";
import { UserDocument } from "~/account/user/typings";
import { ServerError } from "~/lib/server-error";

export async function getUserIdFromReq(req: NextRequest) {
  const token = req.cookies.get(TOKEN_NAME)?.value;
  if (!token) return null;
  const session = await getSessionFromToken(token);
  //token as string)
  if (!session?._id) return null;
  return session?._id;
}

/**
 * Do not fail if user is not found
 * => when fetching "current-user", a null user should be a 200, not a 401
 * because it's expected to get no user if you are not logged in
 * Use "mustGetCurrentUser" if you actually expect the user to be logged in
 * @param req 
 * @returns 
 */
export async function tryGetCurrentUser(req: NextRequest) {
  const userId = await getUserIdFromReq(req);
  if (!userId) {
    return null
  }
  const Users = await getUsersCollection<UserDocument>();
  const currentUser = await Users.findOne(
    { _id: userId },
    { projection: { createdAt: true } }
  );
  if (!currentUser) {
    return null
  }
  return currentUser as UserDocument;

}
/**
 * Experimental: a helper function to be called by Route Handlers
 * Will either throw an error or return the value we want
 */
export async function mustGetCurrentUser(
  req: NextRequest
): Promise<UserDocument> {
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
    { projection: { createdAt: true } }
  );
  if (!currentUser) {
    throw new ServerError({
      id: "user_not_found",
      message: "Could not find current user",
      status: 401,
    });
  }
  return currentUser as UserDocument;
}
