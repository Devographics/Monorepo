// TODO: should be imported dynamically
import countries from "./countries";
// import { normalizeSource } from "./helpers";
import set from "lodash/set.js";
import { getUUID } from "~/lib/email";
import { NormalizationParams, StepFunction } from "../types";
import clone from "lodash/clone";
import { emptyValues } from "../helpers/getSelectors";
import { GenericResponseDocument, FeaturesOptions } from "@devographics/types";
import {
  PAST_PARTICIPATIONS,
  FUTURE_PARTICIPATIONS,
} from "@devographics/constants";

// const replaceAll = function (target, search, replacement) {
//   return target.replace(new RegExp(search, "g"), replacement);
// };

// const convertForCSV = (obj) => {
//   if (!obj || (Array.isArray(obj) && obj.length === 0)) {
//     return "";
//   } else if (typeof obj === "string") {
//     return obj;
//   } else {
//     let s = JSON.stringify(obj);
//     s = replaceAll(s, '"', `'`);
//     // s = replaceAll(s, ',', '\,');
//     return s;
//   }
// };

// const logRow = async (columns, fileName) => {
//   await logToFile(
//     `${fileName}.csv`,
//     columns.map((c) => `"${convertForCSV(c)}"`).join(", ")
//   );
// };

/**
 *
 *  Fields to copy, along with the path at which to copy them (if different)
 *  It also acts as the source of truth to identify empty responses in "responseIsEmpty"
 *  @see surveyadmin/src/lib/normalization/normalize/normalizeDocument.ts
 * @param editionId
 * @returns
 */
export const getFieldsToCopy = (
  editionId: String
): Array<
  [keyof GenericResponseDocument] | [keyof GenericResponseDocument, string]
> => [
  ["year"],
  ["surveyId"],
  ["editionId"],
  ["createdAt"],
  ["createdAtDate"],
  ["updatedAt"],
  ["finishedAt"],
  ["completion", "user_info.completion"],
  ["readingList", "reading_list"],
  ["duration", "user_info.duration"],
  ["userId"],
  ["isFinished"],
  ["knowledgeScore", "user_info.knowledge_score"],
  ["common__user_info__device", "user_info.device"],
  ["common__user_info__browser", "user_info.browser"],
  ["common__user_info__version", "user_info.version"],
  ["common__user_info__os", "user_info.os"],
  ["common__user_info__referrer", "user_info.referrer_raw"],
  ["common__user_info__source", "user_info.sourcetag_raw"],
  [
    // @ts-ignore This question is part of the survey but present on most surveys so it's ok to have it here
    `${editionId}__user_info__how_did_user_find_out_about_the_survey`,
    "user_info.how_did_user_find_out_about_the_survey",
  ],
  // @ts-ignore Legacy
  ["isFake"],
  // @ts-ignore Legacy
  ["common__user_info__authmode", "user_info.authmode"],
  // @ts-ignore Legacy
  [PAST_PARTICIPATIONS, `user_info.${PAST_PARTICIPATIONS}`],
  // @ts-ignore Legacy
  [FUTURE_PARTICIPATIONS, `user_info.${FUTURE_PARTICIPATIONS}`],
];

export const copyFields: StepFunction = async ({
  normResp: normResp_,
  response,
  survey,
  edition,
}: NormalizationParams) => {
  const normResp = clone(normResp_);
  getFieldsToCopy(edition.id).forEach((field) => {
    const [fieldName, fieldPath = fieldName] = field;
    const value = response[fieldName];
    if (value && !emptyValues.includes(value)) {
      set(normResp, fieldPath, response[fieldName]);
    }
  });
  normResp.responseId = response._id;
  normResp.generatedAt = new Date();
  normResp.surveyId = survey.id;
  normResp.editionId = edition.id;
  normResp.year = edition.year;
  return normResp;
};

export const normalizeCountryField: StepFunction = async ({
  normResp: normResp_,
  log,
}: NormalizationParams) => {
  const normResp = clone(normResp_);
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
      // if (log) {
      //   await logToFile(
      //     "countries_normalization.txt",
      //     result.user_info.country
      //   );
      // }
    }
  }
  return normResp;
};

// export const normalizeSourceField: StepFunction = async ({
//   normResp: normResp_,
//   entityRules,
//   survey,
//   verbose,
//   edition,
// }: NormalizationParams) => {
//   const normResp = clone(normResp_);

//   const normSource = await normalizeSource({
//     normResp,
//     entityRules,
//     survey,
//     edition,
//     verbose,
//   });
//   if (normSource.raw) {
//     set(normResp, "user_info.source.raw", normSource.raw);
//   }
//   if (normSource.id) {
//     set(normResp, "user_info.source.normalized", normSource.id);
//   }
//   if (normSource.pattern) {
//     set(normResp, "user_info.source.pattern", normSource.pattern.toString());
//   }
//   return normResp;
// };

export const setUuid: StepFunction = async ({
  response,
  normResp: normResp_,
}) => {
  const normResp = clone(normResp_);

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
  return normResp;
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

export const handleLocale: StepFunction = async ({
  normResp: normResp_,
  response,
}) => {
  const normResp = clone(normResp_);
  const locale = findCorrectLocale(response.locale);
  set(normResp, "user_info.locale", locale);
  return normResp;
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

export const calculateCardinalities: StepFunction = async ({
  normResp: normResp_,
  response,
  survey,
  edition,
}: NormalizationParams) => {
  const _cardinalities = {};
  const normResp = clone(normResp_);
  const toolsSections = edition.sections.filter(
    (s) => s.template && ["tool", "toolv3"].includes(s.template)
  );
  for (const section of toolsSections) {
    let heardCount = 0,
      usedCount = 0;

    for (const question of section.questions) {
      const experience = normResp?.tools?.[question.id]?.experience;
      if (experience === FeaturesOptions.HEARD) {
        heardCount++;
      }
      if (experience === FeaturesOptions.USED) {
        usedCount++;
      }
    }
    _cardinalities[section.id] = {
      [FeaturesOptions.HEARD]: heardCount,
      [FeaturesOptions.USED]: usedCount,
    };
  }
  normResp._cardinalities = _cardinalities;

  return normResp;
};
