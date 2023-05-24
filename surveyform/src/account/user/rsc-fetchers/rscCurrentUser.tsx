/**
 * Methods here are supposed to be cached
 * So they can be used directly in RSC
 */
import { cookies } from "next/headers";
import { cache } from "react";
import { getSessionFromToken, TOKEN_NAME } from "~/account/user/api";
import { loadUser } from "~/lib/users/db-actions/load";

export function getToken() {
  const c = cookies();
  return c.get(TOKEN_NAME)?.value;
}
export const rscCurrentUser = cache(async () => {
  const token = getToken();
  if (!token) return null;
  const session = await getSessionFromToken(token);
  // Get fresh data about the user
  const user = session?._id ? await loadUser({ userId: session._id }) : null;
  return user;
});
