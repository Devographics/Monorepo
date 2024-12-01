import type { PrefilledResponse } from "@devographics/types";
import { apiRoutes } from "~/lib/apiRoutes";
/**
 * Sends the token from the magic link in order to finalize magic login.
 *
 * This token is NOT the final auth token, but the magic token from the URL.
 */
export async function verifyMagicToken({
  token,
  clientData,
}: {
  token: string;
  /**
   * If it contains a surveyId and editionId,
   * we will try to create a response for the user
   * unless user already has a response for this survey
   */
  clientData?: PrefilledResponse;
}) {
  const createResponse = clientData?.surveyId && clientData?.editionId;
  const url = createResponse
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
