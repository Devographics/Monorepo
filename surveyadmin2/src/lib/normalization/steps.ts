// TODO: should be imported dynamically
import countries from "./countries";
import {
  cleanupValue,
  getQuestionObject,
  normalize,
  normalizeSource,
} from "./helpers";
import set from "lodash/set.js";
import intersection from "lodash/intersection.js";
import isEmpty from "lodash/isEmpty.js";
import { getUUID } from "~/lib/email";
import { logToFile } from "@devographics/helpers";
import * as templateFunctions from "@devographics/templates";
import type {
  QuestionMetadata,
  SectionMetadata,
  TemplateFunction,
} from "@devographics/types";
import { NormalizationParams } from "./types";
import { getCollectionByName, newMongoId } from "@devographics/mongo";

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
const getFieldsToCopy = (surveyId) => [
  ["year"],
  ["surveyId"],
  ["editionId"],
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
  [
    `${surveyId}__user_info__how_did_user_find_out_about_the_survey`,
    "user_info.how_did_user_find_out_about_the_survey",
  ],
];

export const copyFields = async ({ normResp, response, survey, edition }) => {
  getFieldsToCopy(edition.surveyId).forEach((field) => {
    const [fieldName, fieldPath = fieldName] = field;
    if (response[fieldName]) {
      set(normResp, fieldPath, response[fieldName]);
    }
  });
  normResp.responseId = response._id;
  normResp.generatedAt = new Date();
  normResp.surveyId = survey.id;
  normResp.editionId = edition.id;
  normResp.year = edition.year;
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

export const normalizeSourceField = async ({
  normResp,
  allRules,
  survey,
  verbose,
  edition,
}: NormalizationParams) => {
  const normSource = await normalizeSource({
    normResp,
    allRules,
    survey,
    edition,
    verbose,
  });
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

const localesTable = [
  {
    id: "en-US",
    aliases: ["en", "en-GB", "en-CA", "en-AU", "en,en", "en,es", "en,de"],
  },
  { id: "de-DE", aliases: ["de,en"] },
  { id: "fr-FR", aliases: ["fr,fr", "fr,en"] },
  { id: "es-ES", aliases: ["es-41", "es-US", "es,en"] },
  { id: "nl-NL", aliases: ["nl,en"] },
  { id: "pl-PL", aliases: ["pl,en"] },
  { id: "zh-Hant", aliases: ["zh-TW"] },
  { id: "zh-Hans", aliases: ["zh-CN"] },
  { id: "ru-RU", aliases: ["ru,en", "ru"] },
  { id: "ja-JP", aliases: ["ja,en"] },
];

// Note: change 'en', 'en-GB', 'en-AU', etc. to 'en-US' for consistency
const findCorrectLocale = (locale) => {
  let correctLocale;
  localesTable.forEach(({ id, aliases }) => {
    if (locale === id || aliases.includes(locale)) {
      correctLocale = id;
    }
  });
  return correctLocale;
};

export const handleLocale = async ({ normResp, response }) => {
  const locale = findCorrectLocale(response.locale);
  set(normResp, "user_info.locale", locale);
};

// export const handlePrivateInfo = async ({
//   privateFields,
//   response,
//   options,
// }: NormalizationParams) => {
//   const PrivateResponses = await getCollectionByName("private_responses");
//   const { isSimulation } = options;
//   /*

//     8. Store identifying info in a separate collection

//     */
//   if (!isEmpty(privateFields)) {
//     const privateInfo: Partial<PrivateResponseDocument> &
//       Pick<PrivateResponseDocument, "user_info"> = {
//       _id: newMongoId(),
//       user_info: {},
//       ...privateFields,
//       surveySlug: response.surveySlug,
//       responseId: response._id,
//     };
//     if (!isSimulation) {
//       // NOTE: findOneAndUpdate and updateOne with option "upsert:true" are roughly equivalent,
//       // but update is probably faster when appliable (the result will have a different shape)
//       await PrivateResponses.updateOne(
//         { responseId: response._id },
//         privateInfo,
//         { upsert: true }
//       );
//     }
//     //set(normResp, "user_info.hash", createHash(response.email));
//   }
// };

// a response must have at least one of those fields to be added to the normalized dataset
// (discard empty responses)
const mustHaveKeys = [
  "features",
  "tools",
  "resources",
  "usage",
  "opinions",
  "environments",
  "employer_info",
];
export const discardEmptyResponses = async ({
  normResp,
  response,
  options,
  errors,
  result,
}: NormalizationParams) => {
  const { verbose } = options;
  // discard empty responses
  if (intersection(Object.keys(normResp), mustHaveKeys).length === 0) {
    if (verbose) {
      console.log(`!! Discarding response ${response._id} as empty`);
    }
    errors.push({ type: "empty_document" });
    result.discard = true;
  }
};

interface NormalizeFieldOptions extends NormalizationParams {
  question: QuestionMetadata;
  section: SectionMetadata;
}

export const normalizeField = async ({
  question,
  normResp,
  prenormalizedFields,
  normalizedFields,
  regularFields,
  options,
  fileName,
  survey,
  edition,
  section,
  allRules,
  privateFields,
  isRenormalization,
}: NormalizeFieldOptions) => {
  let discard = true;

  const {
    document: response,
    log = false,
    fileName: _fileName,
    verbose = false,
  } = options;

  const questionObject = getQuestionObject({
    survey,
    edition,
    section,
    question,
  });

  if (!questionObject) {
    // some outline questions do not have an associated questionObject; just skip them
    return { discard: true };
  }

  const {
    template,
    rawPaths,
    normPaths,
    matchTags: matchTags_ = [],
  } = questionObject;

  if (!rawPaths || !normPaths) {
    console.log(questionObject);
    throw new Error(
      `⛰️ normalizeField error: could not find rawPaths or normPaths for question ${question.id}`
    );
  }

  const prefixWithEditionId = (s) => `${edition.id}__${s}`;

  // automatically add question's own id as a potential match tag
  const matchTags = [...(matchTags_ || []), questionObject.id];

  const processResponseField = async () => {
    // start by copying over the "main" response value
    if (rawPaths.response) {
      const fieldPath = prefixWithEditionId(rawPaths.response);
      const responseValue = cleanupValue(response[fieldPath]);
      if (responseValue) {
        set(normResp, normPaths.response!, responseValue);
        regularFields.push({ fieldPath, value: responseValue });
        discard = false;
      }
      if (verbose) {
        console.log(`⛰️ ${fieldPath}/response: “${responseValue}”`);
      }
    }
  };

  const processCommentField = async () => {
    // copy over the comment value
    if (rawPaths.comment) {
      const fieldPath = prefixWithEditionId(rawPaths.comment);
      const responseCommentValue = cleanupValue(response[fieldPath]);
      if (responseCommentValue) {
        set(normResp, normPaths.comment!, responseCommentValue);
        discard = false;
      }
      if (verbose) {
        console.log(`⛰️ ${fieldPath}/comment: “${responseCommentValue}”`);
      }
    }
  };

  const processPrenormalizedField = async () => {
    // when encountering a prenormalized field, we just copy its value as is
    if (rawPaths.prenormalized) {
      const fieldPath = prefixWithEditionId(rawPaths?.prenormalized);
      const prenormalizedValue = response[fieldPath];
      set(normResp, normPaths.raw!, prenormalizedValue);
      set(normResp, normPaths.prenormalized!, prenormalizedValue);
      set(normResp, normPaths.patterns!, ["prenormalized"]);
      prenormalizedFields.push({
        fieldPath,
        value: prenormalizedValue,
      });
      discard = false;
      if (verbose) {
        console.log(`${fieldPath}/prenormalized: “${prenormalizedValue}”`);
      }
    }
  };

  const processOtherField = async () => {
    // if a field has an "other" path defined, we normalize its contents
    if (rawPaths.other) {
      const fieldPath = prefixWithEditionId(rawPaths?.other);
      const otherValue = cleanupValue(response[fieldPath]);
      if (otherValue) {
        set(normResp, normPaths.raw!, otherValue);

        try {
          const normTokens = await normalize({
            value: otherValue,
            allRules,
            tags: matchTags,
            edition,
            question,
            verbose,
          });

          const normIds = normTokens.map((token) => token.id);
          const normPatterns = normTokens.map((token) =>
            token.pattern.toString()
          );
          set(normResp, normPaths.other!, normIds);
          set(normResp, normPaths.patterns!, normPatterns);

          // keep trace of fields that were normalized
          normalizedFields.push({
            fieldPath,
            questionId: question.id,
            raw: otherValue,
            value: normIds,
            normTokens,
          });

          if (isRenormalization && normIds.length === 0) {
            // if we are renormalizing but didn't find any new tokens, discard operation
            discard = true;
          } else {
            discard = false;
          }

          if (verbose) {
            console.log(`⛰️ ${fieldPath}/other: “${otherValue}”`);
            console.log(`⛰️ -> Tags: ${matchTags.toString()}`);
            console.log(
              `⛰️ -> Normalized values: ${JSON.stringify(normTokens)}`
            );
          }
        } catch (error) {
          set(normResp, normPaths.error!, error.message);
        }
      }
    }
  };

  if (isRenormalization) {
    // when renormalizing an already-normalized response, we only need to worry about the
    // "other" sub-field
    await processOtherField();
  } else {
    // else, when normalizing from scratch we process all sub-fields
    await processResponseField();
    await processCommentField();
    await processPrenormalizedField();
    await processOtherField();
  }

  // note: we only return `discard` because normResp is directly mutated using set()
  return { discard };
};
