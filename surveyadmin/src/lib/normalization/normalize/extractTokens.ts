import uniqBy from "lodash/uniqBy.js";
import { logToFile } from "@devographics/debug";
import {
  FullNormalizationToken,
  QuestionMetadata,
  EditionMetadata,
} from "@devographics/types";
import { EntityRule, stringLimit, rulesLimit } from "./helpers";

export const extractTokens = async ({
  value,
  rules,
  edition,
  question,
  verbose,
}: {
  value: any;
  rules: Array<EntityRule>;
  edition: EditionMetadata;
  question: QuestionMetadata;
  verbose?: boolean;
}) => {
  const rawString = value;

  // RegExp.prototype.toJSON = RegExp.prototype.toString;
  if (rawString.length > stringLimit) {
    await logToFile(
      "normalization_errors.txt",
      "Length Error!  " + rawString + "\n---\n"
    );
    throw new Error(
      `Over string limit (${rules.length} rules, ${rawString.length} characters)`
    );
  }

  const tokens: Array<FullNormalizationToken> = [];
  let count = 0;
  // extract tokens for each rule, storing
  // the start/end index for each match
  // to be used later to detect overlap.
  for (const { pattern, id } of rules) {
    let scanCompleted = false;
    let scanStartIndex = 0;
    // add count to prevent infinite looping
    while (scanCompleted !== true && count < rulesLimit) {
      count++;
      if (count === rulesLimit) {
        console.warn(
          `// Reached rules limit of ${rulesLimit} while normalizing [${rawString}]`
        );
      }
      const stringToScan = rawString.slice(scanStartIndex);
      const match = stringToScan.match(pattern);

      if (match !== null) {
        const includesToken = !!tokens.find((t) => t.id === id);
        if (!includesToken) {
          // make sure we don't add an already-matched token more than one time
          // for example if someone wrote "React, React, React"
          tokens.push({
            id,
            pattern: pattern.toString(),
            match: match[0],
            length: match[0].length,
            rules: rules.length,
            range: [
              scanStartIndex + match.index,
              scanStartIndex + match.index + match[0].length,
            ],
          });
        }
        scanStartIndex += match.index + match[0].length;
      } else {
        scanCompleted = true;
      }
    }
  }

  // sort by length, longer tokens first
  tokens.sort((a, b) => b.length - a.length);

  // for each token look for smaller tokens contained
  // in its range and exclude them.
  const tokensToExclude: Array<number> = [];
  tokens.forEach((token, tokenIndex) => {
    // skip already excluded tokens
    if (tokensToExclude.includes(tokenIndex)) return;

    tokens.forEach((nestedToken, nestedTokenIndex) => {
      // ignore itself & already ignored tokens
      if (
        nestedTokenIndex === tokenIndex ||
        tokensToExclude.includes(nestedTokenIndex)
      )
        return;

      // is the nested token contained in the current token range
      if (
        nestedToken.range[0] >= token.range[0] &&
        nestedToken.range[1] <= token.range[1]
      ) {
        tokensToExclude.push(nestedTokenIndex);
      }
    });
  });

  const filteredTokens = tokens.filter(
    (token, index) => !tokensToExclude.includes(index)
  );

  const uniqueTokens = uniqBy(filteredTokens, (token) => token.id);

  // ensure ids are uniques
  // const uniqueIds = [...new Set(filteredTokens.map((token) => token.id))];
  // alphabetical sort for consistency
  // uniqueIds.sort();
  return uniqueTokens;
};
