import { renameTokens } from "~/lib/normalization/actions/tokens/renameTokens";
import { getApiRouteHandler } from "../../apiRouteHandler";

export const POST = getApiRouteHandler("renameTokens", async (body: any) => {
  const data = await renameTokens(body);
  return data;
});
