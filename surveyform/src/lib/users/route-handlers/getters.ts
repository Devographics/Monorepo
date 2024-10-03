import { NextRequest } from "next/server";
import { getSessionFromToken, TOKEN_NAME } from "~/lib/account/session";
import { UserDocument } from "~/lib/users/typings";
import { HandlerError } from "~/lib/handler-error";
import { loadUser } from "~/lib/users/db-actions/load";

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
 * Use "handlerMustHaveCurrentUser" if you actually expect the user to be logged in
 * @param req
 * @returns
 */
export async function handlerCurrentUser(req: NextRequest) {
  const userId = await getUserIdFromReq(req);
  if (!userId) {
    return null;
  }
  const currentUser = await loadUser({ userId });
  if (!currentUser) {
    return null;
  }
  return currentUser as UserDocument;
}

export async function handlerMustHaveCurrentUser(
  req: NextRequest
): Promise<UserDocument> {
  const userId = await getUserIdFromReq(req);
  if (!userId) {
    throw new HandlerError({
      id: "not_authenticated",
      message: "Not authenticated",
      status: 401,
    });
  }
  const currentUser = await loadUser({ userId });
  if (!currentUser) {
    throw new HandlerError({
      id: "user_not_found",
      message: "Could not find current user",
      status: 401,
    });
  }
  return currentUser as UserDocument;
}
