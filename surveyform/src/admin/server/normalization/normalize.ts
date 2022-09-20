// TODO: should be imported dynamically
import countries from "./countries";
import {
  cleanupValue,
  normalize,
  normalizeSource,
  generateEntityRules,
} from "./helpers";
import { getOrFetchEntities } from "~/modules/entities/server/graphql";
import set from "lodash/set.js";
import last from "lodash/last.js";
import intersection from "lodash/intersection.js";
//import NormalizedResponses from "~/modules/normalized_responses/collection";
//import Responses from "~/modules/responses/collection";
//import PrivateResponses from "~/modules/private_responses/collection";
import { getSurveyBySlug } from "~/modules/surveys/helpers";
import isEmpty from "lodash/isEmpty.js";
import type { Field } from "@devographics/core-models";
import {
  NormalizedResponseMongooseModel,
  NormalizedResponseDocument,
} from "~/admin/models/normalized_responses/model.server";
import {
  PrivateResponseDocument,
  PrivateResponseMongooseModel,
} from "~/admin/models/private_responses/model.server";
import { getUUID } from "~/account/email/api/encryptEmail";
import {
  ResponseAdminMongooseModel,
  logToFile,
} from "@devographics/core-models/server";

// import { ObjectId } from "mongo";

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
const fieldsToCopy = [
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
];

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

const privateFieldPaths = [
  "user_info.github_username",
  "user_info.twitter_username",
];

interface NormalizedField {
  fieldName?: string;
  value: any;
  normTokens?: Array<string>;
}
export const normalizeResponse = async ({
  document: response,
  entities,
  rules,
  log = false,
  fileName: _fileName,
  verbose = false,
}: {
  document: any;
  entities?: Array<any>;
  rules?: any;
  log?: Boolean;
  fileName?: string;
  verbose?: boolean;
}): Promise<
  | {
      result: { _id: string };
      normalizedFields: Array<NormalizedField>;
    }
  | undefined
> => {
  try {
    if (verbose) {
      console.log(`// Normalizing document ${response._id}…`);
    }

    const normResp: Partial<NormalizedResponseDocument> = {};
    const privateFields = {};
    const normalizedFields: Array<NormalizedField> = [];
    const survey = getSurveyBySlug(response.surveySlug);
    if (!survey)
      throw new Error(`Could not find survey for slug ${response.surveySlug}`);

    let allEntities;
    if (entities) {
      allEntities = entities;
    } else {
      console.log("// Getting/fetching entities…");
      allEntities = await getOrFetchEntities();
    }

    const allRules = rules ?? generateEntityRules(allEntities);
    const fileName = _fileName || `${response.surveySlug}_normalization`;

    /*
  
    1. Copy over root fields and assign id
    
    */
    fieldsToCopy.forEach((field) => {
      const [fieldName, fieldPath = fieldName] = field;
      set(normResp, fieldPath, response[fieldName]);
    });
    normResp.responseId = response._id;
    normResp.generatedAt = new Date();
    normResp.survey = survey.context;
    normResp.year = survey.year;

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

    /*
  
    3. Store locale
    
    Note: change 'en', 'en-GB', 'en-AU', etc. to 'en-US' for consistency

    */
    const enLocales = ["en", "en-GB", "en-CA", "en-AU", "en,en"];
    const locale = enLocales.includes(response.locale)
      ? "en-US"
      : response.locale;
    set(normResp, "user_info.locale", locale);

    /*
  
    4. Loop over survey sections and fields (a.k.a. questions)
    
    */
    for (const s of survey.outline) {
      for (const field of s.questions) {
        const { fieldName, matchTags = [] } = field as Field;
        if (!fieldName) throw new Error(`Field without fieldName`);

        const [initialSegment, ...restOfPath] = fieldName.split("__");
        const normPath = restOfPath.join(".");
        const value = response[fieldName];

        // clean value to eliminate empty spaces, "none", "n/a", etc.
        const cleanValue = cleanupValue(value);

        if (cleanValue !== null) {
          if (privateFieldPaths.includes(normPath)) {
            // handle private info fields separately
            set(privateFields, normPath, value);
          } else {
            if (last(restOfPath) === "others") {
              // A. "others" fields needing to be normalized
              set(normResp, `${normPath}.raw`, value);

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
                set(normResp, `${normPath}.normalized`, normIds);
                set(normResp, `${normPath}.patterns`, normPatterns);

                // keep trace of fields that were normalized
                normalizedFields.push({
                  fieldName,
                  value,
                  normTokens,
                });
              } catch (error) {
                set(normResp, `${normPath}.error`, error.message);
              }
            } else if (last(restOfPath) === "prenormalized") {
              // B. these fields are "prenormalized" through autocomplete inputs
              const newPath = normPath.replace(".prenormalized", ".others");
              set(normResp, `${newPath}.raw`, value);
              set(normResp, `${newPath}.normalized`, value);
              set(normResp, `${newPath}.patterns`, ["prenormalized"]);
            } else {
              // C. any other field
              set(normResp, normPath, value);
            }
          }
        }
      }
    }

    /*
  
    5. Discard any "empty" responses
    
    */
    if (intersection(Object.keys(normResp), mustHaveKeys).length === 0) {
      if (verbose) {
        console.log(`!! Discarding response ${response._id} as empty`);
      }
      return;
    }

    /*
  
    6. Normalize country (if provided)
    
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

    /*
  
    7. Handle source field separately
    
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
      // NOTE: findOneAndUpdate and updateOne with option "upsert:true" are roughly equivalent,
      // but update is probably faster when appliable (the result will have a different shape)
      await PrivateResponseMongooseModel.updateOne(
        { responseId: response._id },
        privateInfo,
        { upsert: true }
      );
      //set(normResp, "user_info.hash", createHash(response.email));
    }

    // console.log(JSON.stringify(normResp, '', 2));

    // explicitely create string _id
    // doesn't work currently:
    // MongoServerError: Performing an update on the path '_id' would modify the immutable field '_id'
    // normResp._id = (new ObjectId()).toString()

    // update normalized response, or insert it if it doesn't exist
    // NOTE: this will generate ObjectId _id for unknown reason, see https://github.com/Devographics/StateOfJS-next2/issues/31
    const updatedNormalizedResponse =
      await NormalizedResponseMongooseModel.findOneAndUpdate(
        { responseId: response._id },
        normResp,
        { upsert: true, returnDocument: "after" }
      );
    await ResponseAdminMongooseModel.updateOne(
      { _id: response._id },
      {
        $set: {
          // NOTE: at the time of writing 09/2022 this is not really used by the app
          // the admin area resolve the normalizedResponse based on its responseId (instead of using response.normalizedResponseId)
          // using a reversed relation
          normalizedResponseId: updatedNormalizedResponse._id,
          isNormalized: true,
        },
      }
    );

    // eslint-disable-next-line
    // console.log(result);
    return {
      /*
      Previously was the result of "upsert", but in Mongoose we use findOneAndUpdate instead
      result,*/
      result: updatedNormalizedResponse,
      normalizedFields,
    };
  } catch (error) {
    console.log("// normalizeResponse error");
    console.log(error);
  }
};
