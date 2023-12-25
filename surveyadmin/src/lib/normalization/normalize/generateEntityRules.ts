import { Entity } from "@devographics/types";
import { EntityRule } from "./helpers";
import {
  PARTIAL_WORD_INDICATOR,
  ENTIRE_CONTENTS_INDICATOR,
  LIST_INDICATOR,
  WHOLE_WORD_INDICATOR,
} from "@devographics/constants";
import trim from "lodash/trim";

export const generateEntityRules = (entities: Array<Entity>) => {
  const rules: Array<EntityRule> = [];
  entities
    .filter((e) => !e.apiOnly)
    .forEach((entity) => {
      const { id, patterns, tags = [], twitterName, exactMatch } = entity;

      if (id) {
        if (exactMatch) {
          rules.push({
            id,
            pattern: new RegExp(`\b${id}\b`, "i"),
            tags,
          });
        } else {
          // we match the separator group 0 to 2 times to account for double spaces,
          // double hyphens, etc.
          const separator = "( |-|_|.){0,2}";

          // 1. replace "_" by separator
          const idPatternString = `\\b${id.replaceAll("_", separator)}\\b`;
          const idPattern = new RegExp(idPatternString, "i");
          rules.push({
            id,
            pattern: idPattern,
            tags,
          });

          // generate special matching rule for HTML elements
          if (id.includes("_element")) {
            const [elementName] = id.split("_element");
            const elementPattern = new RegExp(
              `\<${elementName}( )?(\/)?\>`,
              "i"
            );
            rules.push({
              id,
              pattern: elementPattern,
              tags,
            });
            rules.push({
              id,
              pattern: idPattern,
              tags,
            });
          }

          // 4. add custom patterns
          patterns &&
            patterns.forEach((fullPatternString) => {
              const fps = fullPatternString;
              const patternString = trim(
                fps
                  .replace(PARTIAL_WORD_INDICATOR, "")
                  .replace(ENTIRE_CONTENTS_INDICATOR, "")
                  .replace(LIST_INDICATOR, "")
                  .replace(WHOLE_WORD_INDICATOR, "")
              );

              let pattern;

              if (fps.includes(ENTIRE_CONTENTS_INDICATOR)) {
                // [e] only match entire contents
                pattern = new RegExp(`^${patternString}$`, "i");
              } else if (fps.includes(PARTIAL_WORD_INDICATOR)) {
                // [p] match partial words
                pattern = new RegExp(`${patternString}(s)?`, "i");
              } else if (fps.includes(LIST_INDICATOR)) {
                // [l] treat pattern as comma-separated list of items that all need to be matched
                // as partial words
                const items = patternString.split(",");
                pattern = new RegExp(`^(?=.*${items.join(")(?=.*")}).*$`);
              } else {
                // [w] by default, only match whole words
                pattern = new RegExp(`\\b${patternString}(s)?\\b`, "i");
              }

              rules.push({ id, pattern, tags });
            });

          // 5. also add twitter username if available (useful for people entities)
          if (twitterName) {
            const pattern = new RegExp(twitterName, "i");
            rules.push({ id, pattern, tags });
          }
        }
      }
    });
  return rules;
};
