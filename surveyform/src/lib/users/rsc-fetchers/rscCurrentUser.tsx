/**
 * Methods here are supposed to be cached
 * So they can be used directly in RSC
 */
import { cookies, type UnsafeUnwrappedCookies } from "next/headers";
import { cache } from "react";
import { TOKEN_NAME, getSessionFromToken } from "~/lib/account/session";
import { loadUser } from "~/lib/users/db-actions/load";
import { loadUserWithResponses } from "~/lib/users/db-actions/loadWithResponses";

export async function getToken() {
  const c = (await cookies()) as unknown as UnsafeUnwrappedCookies;
  return c.get(TOKEN_NAME)?.value;
}
export const rscCurrentUser = cache(async () => {
  const token = await getToken();
  if (!token) return null;
  const session = await getSessionFromToken(token);
  const user = session?._id ? await loadUser({ userId: session._id }) : null;
  return user;
});

export const rscCurrentUserWithResponses = cache(async () => {
  const token = await getToken();
  if (!token) return null;
  const session = await getSessionFromToken(token);
  const user = session?._id
    ? await loadUserWithResponses({ userId: session._id })
    : null;
  return user;
});
