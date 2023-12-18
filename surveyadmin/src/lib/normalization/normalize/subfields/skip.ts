import { prefixWithEditionId } from "@devographics/templates";
import { SubfieldProcessFunction, getQuestionPaths } from "../normalizeField";

export const skip: SubfieldProcessFunction = async ({
  edition,
  response,
  normResp,
  questionObject,
}) => {
  const { rawPaths } = getQuestionPaths(questionObject);

  if (rawPaths.skip) {
    const fieldPath = prefixWithEditionId(rawPaths?.skip, edition.id);
    const skipValue = !!response[fieldPath];
    if (skipValue) {
      const skippedQuestions = normResp.skipped || [];
      normResp.skipped = [...skippedQuestions, questionObject.id];
      return { normResp };
    }
  }
};
