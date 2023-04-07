import { cookies } from "next/headers";
import { cache } from "react";
import { getSessionFromToken, TOKEN_NAME } from "~/account/user/api";
import { UserMongooseModel } from "~/core/models/user.server";
import { connectToAppDb } from "~/lib/server/mongoose/connection";

export function getToken() {
  const c = cookies();
  return c.get(TOKEN_NAME)?.value;
}
export const getCurrentUser = cache(async () => {
  await connectToAppDb();
  const token = getToken();
  if (!token) return null;
  const session = await getSessionFromToken(token);
  // Get fresh data about the user
  const user = session?._id
    ? (await UserMongooseModel.findById(session._id))?.toObject()
    : null;
  return user;
});
