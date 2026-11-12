import { getApiRouteHandler } from "../../apiRouteHandler";
import { importLLMCoding } from "~/lib/normalization/actions/importLLMCoding";

/*

Import an llm-coding devographics-import.json file for one question.

POST body: { surveyId, editionId, questionId, data, removeExisting?, normalize? }
- data: the import file's contents (object or JSON string)
- removeExisting: remove the question's existing AI tokens first (default: false)
- normalize: renormalize the question's responses afterwards (default: true)

*/
export const POST = getApiRouteHandler("importLLMCoding", async (body: any) => {
  const data = await importLLMCoding(body);
  return data;
});
