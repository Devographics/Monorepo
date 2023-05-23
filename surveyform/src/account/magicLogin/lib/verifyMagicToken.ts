import { apiRoutes } from "~/lib/apiRoutes";
/**
 * Sends the token from the magic link in order to finalize magic login.
 *
 * This token is NOT the final auth token, but the magic token from the URL.
 */
export async function verifyMagicToken(
  token: string,
  /** Pass an existing user id to "upgrade" an anonymous user during its first passwordless login */
  anonymousId?: string
) {
  // NOTE: URL needs an absolute URL so it's not good here
  //const verifyUrl = new URL(
  //  `${window.location.origin}${apiRoutes.account.magicLogin.verifyToken.href}`
  //);
  //verifyUrl.searchParams.set("token", token);
  //if (anonymousId) {
  //  verifyUrl.searchParams.set("anonymousId", anonymousId);
  //}
  // @see https://github.com/mxstbr/passport-magic-login/pull/19
  const url = `${apiRoutes.account.magicLogin.verifyToken.href()}?token=${encodeURIComponent(
    token
  )}${anonymousId ? `&anonymousId=${encodeURIComponent(anonymousId)}` : ""}`;

  const res = await fetch(url, {
    //body: JSON.stringify({ token, anonymousId }),
    method: "GET",
    //headers: {
    //  "Content-Type": "application/json",
    //},
  });
  if (!res.ok) {
    throw new Error(`Could not verify token, ${await res.text()}`);
  }
  return res;
}
