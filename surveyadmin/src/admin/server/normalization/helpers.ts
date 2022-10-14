// import { getSetting, runGraphQL, logToFile } from 'meteor/vulcan:core';
import get from "lodash/get.js";
import intersection from "lodash/intersection.js";
import uniqBy from "lodash/uniqBy.js";
import sortBy from "lodash/sortBy.js";
import compact from "lodash/compact.js";
import isEmpty from "lodash/isEmpty.js";
import type { Entity } from "@devographics/core-models";
import type { SurveyType, SurveyQuestion } from "@devographics/core-models";
import { logToFile } from "@devographics/core-models/server";
import { getOrFetchEntities } from "~/modules/entities/server";

/*

Clean up values to remove 'none', 'n/a', etc.

*/
export const ignoreValues = [
  " ",
  "  ",
  "   ",
  "    ",
  "     ",
  "      ",
  "\n",
  "\n\n",
  "/",
  "\\",
  "*",
  "+",
  "-",
  "—",
  "n/a",
  "N/A",
  "NA",
  "None",
  "none",
  "no",
  "No",
  ".",
  "?",
];
export const cleanupValue = (value) =>
  typeof value === "undefined" || ignoreValues.includes(value) ? null : value;

// Global variable that stores the entities
export let entitiesData: { entities?: any; rules?: any } = {};

export const getEntitiesData = async () => {
  if (isEmpty(entitiesData)) {
    entitiesData = await initEntities();
  }
  return entitiesData;
};

export const initEntities = async () => {
  console.log(`// 🗄️ Initializing entities…`);
  const entities = await getOrFetchEntities();
  const rules = generateEntityRules(entities);
  console.log(`  -> Initializing entities done`);
  return { entities, rules };
};

/*

Extract matching tokens from a string

*/
const enableLimit = false;
const stringLimit = enableLimit ? 170 : 1000; // max length of string to try and find tokens in
const rulesLimit = 1500; // max number of rules to try and match for any given string
const extractTokens = async ({ value, rules, survey, field, verbose }) => {
  const rawString = value;

  if (rawString.length > stringLimit) {
    await logToFile(
      "normalization_errors.txt",
      "Length Error!  " + rawString + "\n---\n"
    );
    throw new Error(
      `Over string limit (${rules.length} rules, ${rawString.length} characters)`
    );
  }

  const tokens: Array<{
    id: string;
    pattern: string;
    match: any;
    length: number;
    rules: number;
    range: [number, number];
  }> = [];
  let count = 0;
  // extract tokens for each rule, storing
  // the start/end index for each match
  // to be used later to detect overlap.
  for (const { pattern, context, fieldId, id } of rules) {
    let scanCompleted = false;
    let scanStartIndex = 0;

    // add count to prevent infinite looping
    while (scanCompleted !== true && count < rulesLimit) {
      count++;
      if (
        context &&
        fieldId &&
        (context !== survey.context || fieldId !== field.id)
      ) {
        // if a context and fieldId are defined for the current rule,
        // abort unless they match the current context and fieldId
        break;
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
  const sortedTokens = sortBy(uniqueTokens, (token) => token.id);

  // ensure ids are uniques
  // const uniqueIds = [...new Set(filteredTokens.map((token) => token.id))];

  // alphabetical sort for consistency
  // uniqueIds.sort();

  return sortedTokens;
};

/*

Normalize a string value

(Can be limited by tags)

*/
export const normalize = async ({
  value,
  allRules,
  tags,
  survey,
  field,
  verbose,
}: {
  value: any;
  allRules: Array<any>;
  tags?: Array<string>;
  survey?: SurveyType;
  field?: SurveyQuestion;
  verbose?: boolean;
}) => {
  const rules = tags
    ? allRules.filter((r) => intersection(tags, r.tags).length > 0)
    : allRules;

  if (verbose) {
    console.log(`// Found ${rules.length} rules to match against`);
  }
  return await extractTokens({ value, rules, survey, field, verbose });
};

/*

Normalize a string value and only keep the first result

*/
export const normalizeSingle = async (options) => {
  const tokens = await normalize(options);
  // put longer tokens first as a proxy for relevancy
  const sortedTokens = sortBy(tokens, (v) => v.id && v.id.length).reverse();
  return sortedTokens[0];
};

/*

Handle source normalization separately since its value can come from 
three different fields (source field, referrer field, 'how did you hear' field)

*/
export const normalizeSource = async (normResp, allRules, survey) => {
  const tags = [
    "sites",
    "podcasts",
    "youtube",
    "socialmedia",
    "newsletters",
    "people",
    "sources",
    `sources_${survey.normalizationId}`
  ];

  const rawSource = get(normResp, "user_info.sourcetag");
  const rawFindOut = get(
    normResp,
    "user_info.how_did_user_find_out_about_the_survey"
  );
  const rawRef = get(normResp, "user_info.referrer");

  try {
    const normSource =
      rawSource &&
      (await normalizeSingle({
        value: rawSource,
        allRules,
        tags,
        survey,
        field: { id: "source" },
      }));
    const normFindOut =
      rawFindOut &&
      (await normalizeSingle({
        value: rawFindOut,
        allRules: allRules,
        tags,
        survey,
        field: { id: "how_did_user_find_out_about_the_survey" },
      }));
    const normReferrer =
      rawRef &&
      (await normalizeSingle({
        value: rawRef,
        allRules: allRules,
        tags,
        survey,
        field: { id: "referrer" },
      }));

    if (normSource) {
      return { ...normSource, raw: rawSource };
    } else if (normFindOut) {
      return { ...normFindOut, raw: rawFindOut };
    } else if (normReferrer) {
      return { ...normReferrer, raw: rawRef };
    } else {
      return { raw: compact([rawSource, rawFindOut, rawRef]).join(", ") };
    }
  } catch (error) {
    console.log(
      `// normaliseSource error for response ${normResp.responseId} with values ${rawSource}, ${rawFindOut}, ${rawRef}`
    );
    throw new Error(error);
  }
};

/*

Generate normalization rules from entities

*/
export const generateEntityRules = (entities: Array<Entity>) => {
  const rules: Array<{
    id: string;
    pattern: RegExp | string;
    context?: string;
    fieldId?: string;
    tags: Array<string>;
  }> = [];
  entities
    .filter((e) => !e.apiOnly)
    .forEach((entity) => {
      const { id, patterns, tags, twitterName } = entity;
      // we match the separator group 0 to 2 times to account for double spaces,
      // double hyphens, etc.
      const separator = "( |-|_|.){0,2}";

      // 1. replace "_" by separator
      const idPatternString = id.replaceAll("_", separator);
      const idPattern = new RegExp(idPatternString, "i");
      rules.push({
        id,
        pattern: idPattern,
        tags: tags || [],
      });

      // note: the following should not be needed because all entities
      // should already follow the foo_js/foo_css forma
      // 2. replace "js" at the end by separator+js
      //if (id.substr(-2) === "js") {
      //  const patternString = id.substr(0, id.length - 2) + separator + "js";
      //  const pattern = new RegExp(patternString, "i");
      //  rules.push({ id, pattern, tags });
      //}
      //
      //    // 3. replace "css" at the end by separator+css
      //    if (id.substr(-3) === "css") {
      //      const patternString = id.substr(0, id.length - 3) + separator + "css";
      //      const pattern = new RegExp(patternString, "i");
      //      rules.push({ id, pattern, tags });
      //    }

      // 4. add custom patterns
      patterns &&
        patterns.forEach((patternString) => {
          /*
          Some patterns are of the form context||question||pattern
          to only match a specific question in a specific context.
          
          For example, for entity "graphql_org":

          state_of_graphql||sites_courses||official documentation
        */

          const patternSegments = patternString.split("||");
          if (patternSegments.length === 3) {
            const pattern = new RegExp(patternSegments[2], "i");
            rules.push({
              id,
              pattern,
              context: patternSegments[0],
              fieldId: patternSegments[1],
              tags: tags || [],
            });
          } else {
            const pattern = new RegExp(patternSegments[0], "i");
            rules.push({ id, pattern, tags: tags || [] });
          }
        });

      // 5. also add twitter username if available (useful for people entities)
      if (twitterName) {
        const pattern = new RegExp(twitterName, "i");
        rules.push({ id, pattern, tags: tags || [] });
      }
    });
  return rules;
};

export const logAllRules = async () => {
  const allEntities = await getOrFetchEntities();
  if (allEntities) {
    let rules = generateEntityRules(allEntities);
    rules = rules.map(({ id, pattern, tags }) => ({
      id,
      pattern: pattern.toString(),
      tags,
    }));
    const json = JSON.stringify(rules, null, 2);

    await logToFile("rules.js", "export default " + json, {
      mode: "overwrite",
    });
  } else {
    console.log("// Could not get entities");
  }
};
