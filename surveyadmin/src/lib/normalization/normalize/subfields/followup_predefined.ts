import { cleanupValue } from "../helpers";
import set from "lodash/set.js";
import { DbPathsEnum } from "@devographics/types";
import { prefixWithEditionId } from "@devographics/templates";
import {
  FieldLogItem,
  SubfieldProcessFunction,
  SubfieldProcessProps,
  getQuestionPaths,
} from "../normalizeField";

export const followup_predefined: SubfieldProcessFunction = async ({
  edition,
  response,
  normResp,
  questionObject,
}: SubfieldProcessProps) => {
  const modifiedFields: FieldLogItem[] = [];

  const { rawPaths, normPaths } = getQuestionPaths(questionObject);

  const rawPredefinedFollowupPaths = rawPaths[DbPathsEnum.FOLLOWUP_PREDEFINED];
  const normPredefinedFollowupPaths =
    normPaths[DbPathsEnum.FOLLOWUP_PREDEFINED];
  if (rawPredefinedFollowupPaths && normPredefinedFollowupPaths) {
    // if field has both a source raw path and a target norm. path defined, proceed
    const subPathKeys = Object.keys(rawPredefinedFollowupPaths);
    for (const subPathKey of subPathKeys) {
      // go through each follow-up subPath and see if it contains a value
      const rawFieldPath = prefixWithEditionId(
        rawPredefinedFollowupPaths[subPathKey],
        edition.id
      );
      const normFieldPath = normPredefinedFollowupPaths[subPathKey];
      const predefinedFollowupValue = cleanupValue(response[rawFieldPath]);

      if (predefinedFollowupValue) {
        // if value exists copy it over to norm. response document
        set(normResp, normFieldPath, predefinedFollowupValue);
        modifiedFields.push({
          questionId: questionObject.id,
          fieldPath: rawFieldPath,
          value: predefinedFollowupValue,
        });
        return { normResp, modifiedFields };
      }
    }
  }
};
