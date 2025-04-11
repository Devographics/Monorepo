import { deleteTokens } from "~/lib/normalization/actions/tokens/deleteTokens";
import { getApiRouteHandler } from "../../apiRouteHandler";

export const POST = getApiRouteHandler("deleteTokens", async (body: any) => {
  const data = await deleteTokens(body);
  return data;
});
