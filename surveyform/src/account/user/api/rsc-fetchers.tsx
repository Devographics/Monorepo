/**
 * Methods here are supposed to be cached
 * So they can be used directly in RSC
 */
import { getUsersCollection } from "@devographics/mongo";
import { cookies } from "next/headers";
import { cache } from "react";
import { getSessionFromToken, TOKEN_NAME } from "~/account/user/api";
import { UserDocument } from "~/account/user/typings";

export function getToken() {
  const c = cookies();
  return c.get(TOKEN_NAME)?.value;
}

export const getCurrentUser = cache(async () => {
  const token = getToken();
  if (!token) return null;
  const session = await getSessionFromToken(token);
  // Get fresh data about the user
  const Users = await getUsersCollection<UserDocument>();
  const user = session?._id ? await Users.findOne({ _id: session._id }) : null;
  return user;
});
