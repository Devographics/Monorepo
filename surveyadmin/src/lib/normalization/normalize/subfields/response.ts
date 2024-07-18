import set from "lodash/set.js";
import { prefixWithEditionId } from "@devographics/templates";
import {
  FieldLogItem,
  SubfieldProcessFunction,
  getQuestionPaths,
} from "../normalizeField";
import uniq from "lodash/uniq.js";

export const response: SubfieldProcessFunction = async ({
  edition,
  response,
  normResp,
  questionObject,
}) => {
  const { filterFunction } = questionObject;
  const modifiedFields: FieldLogItem[] = [];
  const { rawPaths, normPaths } = getQuestionPaths(questionObject);
  // start by copying over the "main" response value
  if (rawPaths.response && normPaths.response) {
    const fieldPath = prefixWithEditionId(rawPaths.response, edition.id);
    let responseValue = response[fieldPath];
    // if value is an array, remove any duplicates
    if (Array.isArray(responseValue)) {
      responseValue = uniq(responseValue);
    }
    const isNotUndefined = typeof responseValue !== "undefined";
    // if question has a filter function associated, use it to test validity of response
    const isValid = filterFunction
      ? isNotUndefined && filterFunction(responseValue)
      : isNotUndefined;
    if (isValid) {
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
