import { SubfieldProcessFunction, getQuestionPaths } from "../normalizeField";

export const followup_freeform: SubfieldProcessFunction = async ({
  edition,
  response,
  normResp,
  questionObject,
}) => {
  const { rawPaths, normPaths } = getQuestionPaths(questionObject);
  // not implemented yet
};
