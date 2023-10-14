import { EditionMetadata, QuestionTemplateOutput } from "@devographics/types";
import { NormalizationToken } from "../types";
import { extractTokens } from "./extractTokens";
import { getQuestionRules } from "./getQuestionRules";
import { EntityRule } from "./helpers";

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
}: {
  values: any[];
  entityRules: EntityRule[];
  edition: EditionMetadata;
  questionObject: QuestionTemplateOutput;
  verbose?: boolean;
}) => {
  const rules = getQuestionRules({ questionObject, entityRules, verbose });
  let allTokens: NormalizationToken[] = [];
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
