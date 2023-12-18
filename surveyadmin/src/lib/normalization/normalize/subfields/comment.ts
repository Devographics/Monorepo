import { cleanupValue } from "../helpers";
import set from "lodash/set.js";
import { prefixWithEditionId } from "@devographics/templates";
import {
  FieldLogItem,
  SubfieldProcessProps,
  getQuestionPaths,
} from "../normalizeField";

export const comment = async ({
  edition,
  response,
  normResp,
  questionObject,
}: SubfieldProcessProps) => {
  const { rawPaths, normPaths } = getQuestionPaths(questionObject);
  const modifiedFields: FieldLogItem[] = [];
  // copy over the comment value
  if (rawPaths.comment) {
    const fieldPath = prefixWithEditionId(rawPaths.comment, edition.id);
    const responseCommentValue = cleanupValue(response[fieldPath]);
    if (responseCommentValue) {
      set(normResp, normPaths.comment!, responseCommentValue);
      modifiedFields.push({
        questionId: questionObject.id,
        fieldPath,
        value: responseCommentValue,
      });
      return { normResp, modifiedFields };
    }
  }
};
