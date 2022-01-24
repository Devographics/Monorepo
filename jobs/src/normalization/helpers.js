import crypto from 'crypto';
import { getSetting, runGraphQL, logToFile } from 'meteor/vulcan:core';
import get from 'lodash/get';
import intersection from 'lodash/intersection';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';

/*

Encrypt text

*/
const encryptionKey = process.env.ENCRYPTION_KEY || getSetting('encriptionKey');
export const encrypt = (text) => {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(encryptionKey),
    'stateofjsstateof'
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString('hex');
};

/*

Clean up values to remove 'none', 'n/a', etc.

*/
export const ignoreValues = [
  ' ',
  '  ',
  '   ',
  '    ',
  '     ',
  '      ',
  '\n',
  '\n\n',
  '/',
  '\\',
  '*',
  '+',
  '-',
  '—',
  'n/a',
  'N/A',
  'NA',
  'None',
  'none',
  'no',
  'No',
  '.',
  '?',
];
export const cleanupValue = (value) =>
  typeof value === 'undefined' || ignoreValues.includes(value) ? null : value;

/*

Get entities

*/
const entitiesQuery = `query EntitiesQuery {
  entities{
    id
    category
    tags
    patterns
    twitterName
  }
}
`;

export const getEntities = async () => {
  try {
    return get(await runGraphQL(entitiesQuery), 'data.entities');
  } catch (error) {
    console.log('// getEntities error');
    throw new Error(error);
  }
};

/*

Extract matching tokens from a string

*/
const enableLimit = false;
const lowStringLimit = 150;
const highStringLimit = 190;
const extractTokens = async (rawString, rules) => {
  const stringLimit = enableLimit
    ? rules.length > 50
      ? lowStringLimit
      : highStringLimit
    : 1000;

  if (rawString.length > stringLimit) {
    await logToFile(
      'normalization_errors.txt',
      'Length Error!  ' + rawString + '\n---\n'
    );
    throw new Error(
      `Over string limit (${rules.length} rules, ${rawString.length} characters)`
    );
  }

  const tokens = [];
  let count = 0;
  // extract tokens for each rule, storing
  // the start/end index for each match
  // to be used later to detect overlap.
  for (const { pattern, id } of rules) {
    let scanCompleted = false;
    let scanStartIndex = 0;

    // add count to prevent infinite looping
    while (scanCompleted !== true && count < 400) {
      count++;
      const stringToScan = rawString.slice(scanStartIndex);
      const match = stringToScan.match(pattern);
      if (match !== null) {
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
  const tokensToExclude = [];
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
export const normalize = async (value, allRules, tags) => {
  const rules = tags
    ? allRules.filter((r) => intersection(tags, r.tags).length > 0)
    : allRules;

  return await extractTokens(value, rules);
};

/*

Normalize a string value and only keep the first result

*/
export const normalizeSingle = async (value, allRules, matchCategories) => {
  const tokens = await normalize(value, allRules, matchCategories, false);
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
    'sites',
    'podcasts',
    'youtube',
    'socialmedia',
    'newsletters',
    'people',
    'sources',
  ];

  // add a special rule for emails to normalize "email" sources into current survey id
  const allRulesWithEmail = [
    ...allRules,
    {
      id: survey.normalizationId,
      pattern: /e( |-)*mail/i,
      tags: ['sources'],
    },
    {
      id: survey.normalizationId,
      pattern: /mail.google.com/i,
      tags: ['sources'],
    },
  ];

  const rawSource = get(normResp, 'user_info.sourcetag');
  const rawFindOut = get(
    normResp,
    'user_info.how_did_user_find_out_about_the_survey'
  );
  const rawRef = get(normResp, 'user_info.referrer');

  try {
    const normSource =
      rawSource && (await normalizeSingle(rawSource, allRules, tags));
    const normFindOut =
      rawFindOut &&
      (await normalizeSingle(rawFindOut, allRulesWithEmail, tags));
    const normReferrer =
      rawRef && (await normalizeSingle(rawRef, allRulesWithEmail, tags));

    if (normSource) {
      return { ...normSource, raw: rawSource };
    } else if (normFindOut) {
      return { ...normFindOut, raw: rawFindOut };
    } else if (normReferrer) {
      return { ...normReferrer, raw: rawRef };
    } else {
      return;
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
export const generateEntityRules = (entities) => {
  const rules = [];
  entities.forEach((entity) => {
    const { id, patterns, tags, twitterName } = entity;
    // we match the separator group 1 to 2 times to account for double spaces,
    // double hyphens, etc.
    const separator = '( |-|_|.){1,2}';

    // 1. replace "_" by separator
    const idPatternString = id.replaceAll('_', separator);
    const idPattern = new RegExp(idPatternString, 'i');
    rules.push({
      id,
      pattern: idPattern,
      tags,
    });

    // 2. replace "js" at the end by separator+js
    if (id.substr(-2) === 'js') {
      const patternString = id.substr(0, id.length - 2) + separator + 'js';
      const pattern = new RegExp(patternString, 'i');
      rules.push({ id, pattern, tags });
    }

    // 3. replace "css" at the end by separator+css
    if (id.substr(-3) === 'css') {
      const patternString = id.substr(0, id.length - 3) + separator + 'css';
      const pattern = new RegExp(patternString, 'i');
      rules.push({ id, pattern, tags });
    }

    // 4. add custom patterns
    patterns &&
      patterns.forEach((patternString) => {
        const pattern = new RegExp(patternString, 'i');
        rules.push({ id, pattern, tags });
      });

    // 5. also add twitter username if available (useful for people entities)
    if (twitterName) {
      const pattern = new RegExp(twitterName, 'i');
      rules.push({ id, pattern, tags });
    }
  });
  return rules;
};

export const logAllRules = async () => {
  const allEntities = await getEntities();
  let rules = generateEntityRules(allEntities);
  rules = rules.map(({ id, pattern, tags }) => ({
    id,
    pattern: pattern.toString(),
    tags,
  }));
  const json = JSON.stringify(rules, null, 2);

  await logToFile('rules.js', 'export default ' + json, {
    mode: 'overwrite',
  });
};

export const getSurveyBySlug = (slug) => surveys.find((s) => s.slug === slug);
