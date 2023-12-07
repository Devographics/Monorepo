import { EditionMetadata, QuestionTemplateOutput } from "@devographics/types";
import { FullNormalizationToken } from "../types";
import { extractTokens } from "./extractTokens";
import { getQuestionRules } from "./getQuestionRules";
import { EntityRule } from "./helpers";
import { logToFile } from "@devographics/debug";

/*

Normalize a string value

(Can be limited by tags)

*/
export const normalize = async ({
  values,
  questionObject,
  entityRules,
  edition,
  verbose,
  timestamp,
}: {
  values: any[];
  entityRules: EntityRule[];
  edition: EditionMetadata;
  questionObject: QuestionTemplateOutput;
  verbose?: boolean;
  timestamp: string;
}) => {
  const rules = getQuestionRules({ questionObject, entityRules, verbose });
  let allTokens: FullNormalizationToken[] = [];
  for (const value of values) {
    const tokens = await extractTokens({
      value,
      rules,
      edition,
      question: questionObject,
      verbose,
    });
    allTokens = [...allTokens, ...tokens];
  }
  return allTokens;
};
