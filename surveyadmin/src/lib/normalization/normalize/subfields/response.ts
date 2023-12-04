import set from "lodash/set.js";
import { prefixWithEditionId } from "@devographics/templates";
import {
  FieldLogItem,
  SubfieldProcessFunction,
  getQuestionPaths,
} from "../normalizeField";

export const response: SubfieldProcessFunction = async ({
  edition,
  response,
  normResp,
  questionObject,
}) => {
  const modifiedFields: FieldLogItem[] = [];
  const { rawPaths, normPaths } = getQuestionPaths(questionObject);
  // start by copying over the "main" response value
  if (rawPaths.response && normPaths.response) {
    const fieldPath = prefixWithEditionId(rawPaths.response, edition.id);
    const responseValue = response[fieldPath];
    if (typeof responseValue !== "undefined") {
      set(normResp, normPaths.response!, responseValue);
      modifiedFields.push({
        questionId: questionObject.id,
        fieldPath,
        value: responseValue,
      });
      return { normResp, modifiedFields };
    }
  }
};
