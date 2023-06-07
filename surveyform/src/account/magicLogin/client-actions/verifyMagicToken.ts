import { PrefilledData } from "~/components/page/hooks";
import { apiRoutes } from "~/lib/apiRoutes";
/**
 * Sends the token from the magic link in order to finalize magic login.
 *
 * This token is NOT the final auth token, but the magic token from the URL.
 */
export async function verifyMagicToken({
  token,
  redirectTo,
  clientData,
}: {
  token: string;
  redirectTo?: string;
  clientData?: PrefilledData;
}) {
  // NOTE: URL needs an absolute URL so it's not good here
  //const verifyUrl = new URL(
  //  `${window.location.origin}${apiRoutes.account.magicLogin.verifyToken.href}`
  //);
  //verifyUrl.searchParams.set("token", token);
  //if (anonymousId) {
  //  verifyUrl.searchParams.set("anonymousId", anonymousId);
  //}
  // @see https://github.com/mxstbr/passport-magic-login/pull/19
  const url = clientData
    ? apiRoutes.account.magicLogin.verifyTokenAndFindCreateResponse.href({
        token,
        ...clientData,
      })
    : apiRoutes.account.magicLogin.verifyToken.href({
        token,
      });

  // TODO: would be nice to use POST instead of GET here but passport
  // does not seem to accept POST?
  const res = await fetch(url, {
    method: "GET",
    // body: JSON.stringify({ redirectTo, clientData }),
  });
  if (!res.ok) {
    throw new Error(`Could not verify token, ${await res.text()}`);
  }
  return res;
}
