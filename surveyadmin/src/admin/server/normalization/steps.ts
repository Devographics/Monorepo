// TODO: should be imported dynamically
import countries from "./countries";
import {
  cleanupValue,
  normalize,
  normalizeSource,
  getFieldPaths,
} from "./helpers";
import set from "lodash/set.js";
import last from "lodash/last.js";
import intersection from "lodash/intersection.js";
import isEmpty from "lodash/isEmpty.js";
import type { Field, ParsedQuestion } from "@devographics/core-models";
import { NormalizedResponseMongooseModel } from "~/admin/models/normalized_responses/model.server";
import {
  PrivateResponseDocument,
  PrivateResponseMongooseModel,
} from "~/admin/models/private_responses/model.server";
import { getUUID } from "~/account/email/api/encryptEmail";
import { logToFile } from "@devographics/core-models/server";

const replaceAll = function (target, search, replacement) {
  return target.replace(new RegExp(search, "g"), replacement);
};

const convertForCSV = (obj) => {
  if (!obj || (Array.isArray(obj) && obj.length === 0)) {
    return "";
  } else if (typeof obj === "string") {
    return obj;
  } else {
    let s = JSON.stringify(obj);
    s = replaceAll(s, '"', `'`);
    // s = replaceAll(s, ',', '\,');
    return s;
  }
};

const logRow = async (columns, fileName) => {
  await logToFile(
    `${fileName}.csv`,
    columns.map((c) => `"${convertForCSV(c)}"`).join(", ")
  );
};

// fields to copy, along with the path at which to copy them (if different)
const getFieldsToCopy = surveyId => [
  ["surveySlug"],
  ["createdAt"],
  ["updatedAt"],
  ["finishedAt"],
  ["completion", "user_info.completion"],
  ["userId"],
  ["isFake"],
  ["isFinished"],
  ["knowledgeScore", "user_info.knowledge_score"],
  ["common__user_info__device", "user_info.device"],
  ["common__user_info__browser", "user_info.browser"],
  ["common__user_info__version", "user_info.version"],
  ["common__user_info__os", "user_info.os"],
  ["common__user_info__referrer", "user_info.referrer"],
  ["common__user_info__source", "user_info.sourcetag"],
  ["common__user_info__authmode", "user_info.authmode"],
  [`${surveyId}__user_info__how_did_user_find_out_about_the_survey`, "user_info.how_did_user_find_out_about_the_survey"]
];

export const copyFields = async ({ normResp, response, survey }) => {
  getFieldsToCopy(survey.surveyId).forEach((field) => {
    const [fieldName, fieldPath = fieldName] = field;
    set(normResp, fieldPath, response[fieldName]);
  });
  normResp.responseId = response._id;
  normResp.generatedAt = new Date();
  normResp.survey = survey.context;
  normResp.year = survey.year;
};

export const normalizeCountryField = async ({ normResp, options }) => {
  const { log } = options;
  /*

  5c. Normalize country (if provided)
  
  */
  if (normResp?.user_info?.country) {
    set(normResp, "user_info.country_alpha2", normResp.user_info.country);
    const countryNormalized = countries.find(
      (c) => c["alpha-2"] === normResp?.user_info?.country
    );
    if (countryNormalized) {
      set(normResp, "user_info.country_name", countryNormalized.name);
      set(normResp, "user_info.country_alpha3", countryNormalized["alpha-3"]);
    } else {
      if (log) {
        await logToFile(
          "countries_normalization.txt",
          normResp.user_info.country
        );
      }
    }
  }
};

export const normalizeSourceField = async ({ normResp, allRules, survey }) => {
  /*

  5d. Handle source field separately

  */
  const normSource = await normalizeSource(normResp, allRules, survey);
  if (normSource.raw) {
    set(normResp, "user_info.source.raw", normSource.raw);
  }
  if (normSource.id) {
    set(normResp, "user_info.source.normalized", normSource.id);
  }
  if (normSource.pattern) {
    set(normResp, "user_info.source.pattern", normSource.pattern.toString());
  }
};

export const setUuid = async ({ response, normResp }) => {
  /*
    
      2. Generate email hash

      TODO: clarifiy, is this the email from current user (we
        don't have it anymore), or the email from "user_info" part,
        which will stay and should be hashed?

      NOTE: eventhough we don't store the user email,
      we can have an "email" field in the survey if user still 
      want to send their email afterward
      => we need to hash it as well
      
      */
  if (response.emailHash) {
    // If we have already seen this email, use the same uuid
    // Otherwise create a new one
    const emailHash = response.emailHash;
    const emailUuid = await getUUID(emailHash, response.userId);
    set(normResp, "user_info.uuid", emailUuid);
  }
};

export const handleLocale = async ({ normResp, response }) => {
  /*
  
    3. Store locale
    
    Note: change 'en', 'en-GB', 'en-AU', etc. to 'en-US' for consistency

    */
  const enLocales = ["en", "en-GB", "en-CA", "en-AU", "en,en"];
  const locale = enLocales.includes(response.locale)
    ? "en-US"
    : response.locale;
  set(normResp, "user_info.locale", locale);
};

export const handlePrivateInfo = async ({
  privateFields,
  response,
  options,
}) => {
  const { isSimulation } = options;
  /*
  
    8. Store identifying info in a separate collection
    
    */
  if (!isEmpty(privateFields)) {
    const privateInfo: Partial<PrivateResponseDocument> &
      Pick<PrivateResponseDocument, "user_info"> = {
      user_info: {},
      ...privateFields,
      surveySlug: response.surveySlug,
      responseId: response._id,
    };
    if (!isSimulation) {
      // NOTE: findOneAndUpdate and updateOne with option "upsert:true" are roughly equivalent,
      // but update is probably faster when appliable (the result will have a different shape)
      await PrivateResponseMongooseModel.updateOne(
        { responseId: response._id },
        privateInfo,
        { upsert: true }
      );
    }
    //set(normResp, "user_info.hash", createHash(response.email));
  }
};

// a response must have at least one of those fields to be added to the normalized dataset
// (discard empty responses)
const mustHaveKeys = [
  "features",
  "tools",
  "resources",
  "usage",
  "opinions",
  "environments",
];
export const discardEmptyResponses = async ({
  normResp,
  response,
  options,
  errors,
  result,
}) => {
  const { verbose } = options;
  // discard empty responses
  if (intersection(Object.keys(normResp), mustHaveKeys).length === 0) {
    if (verbose) {
      console.log(`!! Discarding response ${response._id} as empty`);
    }
    errors.push({ type: "empty_document", documentId: response._id });
    return { ...result, errors };
  }
};

const privateFieldPaths = [
  "user_info.github_username",
  "user_info.twitter_username",
];

export const normalizeField = async ({
  field,
  normResp,
  prenormalizedFields,
  normalizedFields,
  regularFields,
  options,
  fileName,
  survey,
  allRules,
  privateFields,
}) => {
  const {
    document: response,
    log = false,
    fileName: _fileName,
    verbose = false,
  } = options;

  const { fieldName, suffix, matchTags = [] } = field as ParsedQuestion;
  if (!fieldName) throw new Error(`Field without fieldName`);
  const { basePath, rawFieldPath, normalizedFieldPath, patternsFieldPath, errorPath } = getFieldPaths(field);

  const value = response[fieldName];

  // clean value to eliminate empty spaces, "none", "n/a", etc.
  const cleanValue = cleanupValue(value);

  if (cleanValue !== null) {
    if (privateFieldPaths.includes(basePath)) {
      // handle private info fields separately
      set(privateFields, basePath, value);
    } else {
      if (suffix === "others") {
        // A. "others" fields needing to be normalized
        set(normResp, rawFieldPath, value);

        if (log) {
          await logToFile(
            `${fileName}.txt`,
            `${
              response._id
            }, ${fieldName}, ${cleanValue}, ${matchTags.toString()}`
          );
        }
        try {
          if (verbose) {
            console.log(
              `// Normalizing key "${fieldName}" with value "${value}" and tags ${matchTags.toString()}…`
            );
          }

          const normTokens = await normalize({
            value: cleanValue,
            allRules,
            tags: matchTags,
            survey,
            field,
            verbose,
          });
          if (verbose) {
            console.log(
              `  -> Normalized values: ${JSON.stringify(normTokens)}`
            );
          }

          // console.log(
          //   `  -> Normalized values: ${JSON.stringify(normTokens)}`
          // );

          if (log) {
            if (normTokens.length > 0) {
              normTokens.forEach(async (token) => {
                const { id, pattern, rules, match } = token;
                await logRow(
                  [
                    response._id,
                    fieldName,
                    value,
                    matchTags,
                    id,
                    pattern,
                    rules,
                    match,
                  ],
                  fileName
                );
              });
            } else {
              await logRow(
                [
                  response._id,
                  fieldName,
                  value,
                  matchTags,
                  "n/a",
                  "n/a",
                  "n/a",
                  "n/a",
                ],
                fileName
              );
            }
          }

          const normIds = normTokens.map((token) => token.id);
          const normPatterns = normTokens.map((token) =>
            token.pattern.toString()
          );
          set(normResp, normalizedFieldPath, normIds);
          set(normResp, patternsFieldPath, normPatterns);

          // keep trace of fields that were normalized
          normalizedFields.push({
            fieldName,
            value,
            normTokens,
          });
        } catch (error) {
          set(normResp, errorPath, error.message);
        }
      } else if (suffix === "prenormalized") {
        // B. these fields are "prenormalized" through autocomplete inputs
        const newPath = basePath.replace(".prenormalized", ".others");
        set(normResp, `${newPath}.raw`, value);
        set(normResp, `${newPath}.normalized`, value);
        set(normResp, `${newPath}.patterns`, ["prenormalized"]);

        prenormalizedFields.push({
          fieldName,
          value,
        });
      } else {
        // C. any other field
        set(normResp, basePath, value);
        regularFields.push({
          fieldName,
          value,
        });
      }
    }
  }
};
