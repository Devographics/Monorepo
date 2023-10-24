import { QuestionTemplateOutput } from "@devographics/types";
import { EntityRule } from "./helpers";

export const getQuestionRules = ({
  entityRules,
  questionObject,
  verbose,
}: {
  entityRules: EntityRule[];
  questionObject: QuestionTemplateOutput;
  verbose?: boolean;
}) => {
  // automatically add question's own id as a potential match tag
  const matchTags = [questionObject.id, ...(questionObject.matchTags || [])];

  if (!matchTags || matchTags.length === 0) {
    throw new Error(
      `getQuestionRules: no matchTags defined for question ${questionObject.id}`
    );
  }

  let rules: EntityRule[] = [];
  matchTags.forEach((matchTag) => {
    // for each match tag, add all corresponding rules
    // make sure to preserve matchTag order, as it's used for match priority
    const tagRules = entityRules.filter((r) => r.tags.includes(matchTag));
    rules = [...rules, ...tagRules];
  });
  // const rules = entityRules.filter((r) => intersection(matchTags, r.tags).length > 0)
  if (verbose) {
    if (rules.length === 0) {
      console.warn(
        `‼️ normalize: found no rules for question [${
          questionObject.id
        }] with matchTags [${matchTags?.join(", ")}]`
      );
    } else {
      console.log(`// Found ${rules.length} rules to match against`);
    }
  }
  return rules;
};
