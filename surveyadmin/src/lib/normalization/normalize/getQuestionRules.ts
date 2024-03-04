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
  const { id, matchTags, disallowedTokenIds } = questionObject;

  // automatically add question's own id as a potential match tag
  const allMatchTags = [id, ...(matchTags || [])];

  if (!allMatchTags || allMatchTags.length === 0) {
    throw new Error(
      `getQuestionRules: no matchTags defined for question ${id}`
    );
  }

  let rules: EntityRule[] = [];
  allMatchTags.forEach((matchTag) => {
    // for each match tag, add all corresponding rules
    // make sure to preserve matchTag order, as it's used for match priority
    const tagRules = entityRules.filter((r) => r.tags.includes(matchTag));
    rules = [...rules, ...tagRules];
  });
  // const rules = entityRules.filter((r) => intersection(matchTags, r.tags).length > 0)
  if (verbose) {
    if (rules.length === 0) {
      console.warn(
        `‼️ normalize: found no rules for question [${id}] with matchTags [${allMatchTags?.join(
          ", "
        )}]`
      );
    } else {
      console.log(`// Found ${rules.length} rules to match against`);
    }
  }
  // filter out disallowed tokens
  if (disallowedTokenIds) {
    rules = rules.filter((rule) => !disallowedTokenIds.includes(rule.id));
  }
  return rules;
};
