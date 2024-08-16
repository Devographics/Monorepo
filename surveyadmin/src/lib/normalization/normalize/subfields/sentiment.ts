import set from "lodash/set.js";
import { prefixWithEditionId } from "@devographics/templates";
import {
  FieldLogItem,
  SubfieldProcessProps,
  getQuestionPaths,
} from "../normalizeField";

export const sentiment = async ({
  edition,
  response,
  normResp,
  questionObject,
}: SubfieldProcessProps) => {
  const { rawPaths, normPaths } = getQuestionPaths(questionObject);
  const modifiedFields: FieldLogItem[] = [];
  // copy over the sentiment value
  if (rawPaths.sentiment) {
    const fieldPath = prefixWithEditionId(rawPaths.sentiment, edition.id);
    const responseSentimentValue = response[fieldPath];
    if (responseSentimentValue) {
      set(normResp, normPaths.sentiment!, responseSentimentValue);
      modifiedFields.push({
        questionId: questionObject.id,
        fieldPath,
        value: responseSentimentValue,
      });
      return { normResp, modifiedFields };
    }
  }
};
