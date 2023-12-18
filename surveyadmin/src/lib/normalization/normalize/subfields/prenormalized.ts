import set from "lodash/set.js";
import { prefixWithEditionId } from "@devographics/templates";
import {
  FieldLogItem,
  SubfieldProcessFunction,
  SubfieldProcessProps,
  getQuestionPaths,
} from "../normalizeField";

export const prenormalized: SubfieldProcessFunction = async ({
  edition,
  response,
  normResp,
  questionObject,
}: SubfieldProcessProps) => {
  const modifiedFields: FieldLogItem[] = [];

  const { rawPaths, normPaths } = getQuestionPaths(questionObject);
  // when encountering a prenormalized field, we just copy its value as is
  if (rawPaths.prenormalized) {
    const fieldPath = prefixWithEditionId(rawPaths?.prenormalized, edition.id);
    const prenormalizedValue = response[fieldPath];
    if (prenormalizedValue) {
      set(normResp, normPaths.prenormalized!, prenormalizedValue);
      modifiedFields.push({
        questionId: questionObject.id,
        fieldPath,
        value: prenormalizedValue,
      });
      return { normResp, modifiedFields };
    }
  }
};
