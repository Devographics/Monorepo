import { cookies } from "next/headers";
import { cache } from "react";
import { AUTH_TOKEN, getSessionFromToken } from "~/lib/account/session";
import { loadUser } from "~/lib/users/db-actions/load";
import { loadUserWithResponses } from "~/lib/users/db-actions/loadWithResponses";

async function getAuthToken() {
  const c = await cookies();
  return c.get(AUTH_TOKEN)?.value;
}

export const rscCurrentUser = cache(async () => {
  const token = await getAuthToken();
  if (!token) return null;
  const session = await getSessionFromToken(token);
  const user = session?._id ? await loadUser({ userId: session._id }) : null;
  return user;
});

export const rscCurrentUserWithResponses = cache(async () => {
  const token = await getAuthToken();
  if (!token) return null;
  const session = await getSessionFromToken(token);
  const user = session?._id
    ? await loadUserWithResponses({ userId: session._id })
    : null;
  return user;
});
