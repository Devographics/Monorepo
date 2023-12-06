import { Entity } from "@devographics/types";
import { EntityRule } from "./helpers";

export const generateEntityRules = (entities: Array<Entity>) => {
  const rules: Array<EntityRule> = [];
  entities
    .filter((e) => !e.apiOnly)
    .forEach((entity) => {
      const { id, patterns, tags, twitterName, exactMatch } = entity;

      if (id) {
        if (exactMatch) {
          rules.push({
            id,
            pattern: new RegExp(`\b${id}\b`, "i"),
            tags: tags || [],
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
            tags: tags || [],
          });

          // 4. add custom patterns
          patterns &&
            patterns.forEach((patternString) => {
              const pattern = new RegExp(`\\b${patternString}\\b`, "i");
              rules.push({ id, pattern, tags: tags || [] });
            });

          // 5. also add twitter username if available (useful for people entities)
          if (twitterName) {
            const pattern = new RegExp(twitterName, "i");
            rules.push({ id, pattern, tags: tags || [] });
          }
        }
      }
    });
  return rules;
};
