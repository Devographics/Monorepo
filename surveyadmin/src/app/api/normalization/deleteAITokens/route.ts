import { getApiRouteHandler } from "../../apiRouteHandler";
import { deleteAITokens } from "~/lib/normalization/actions/tokens/deleteAITokens";

export const POST = getApiRouteHandler("deleteAITokens", async (body: any) => {
  const data = await deleteAITokens(body);
  return data;
});
