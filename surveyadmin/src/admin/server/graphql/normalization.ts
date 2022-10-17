import get from "lodash/get.js";
import { normalizeResponse } from "../normalization/normalize";
import {
  getSelector,
  getUnnormalizedResponses,
} from "../normalization/helpers";
import { UserType } from "~/core/models/user";
import { ResponseAdminMongooseModel } from "@devographics/core-models/server";
import { getOrFetchEntities } from "~/modules/entities/server";
import pick from "lodash/pick.js";

/*

Normalization

*/
export const normalizeIds = async (
  root,
  args,
  { currentUser }: { currentUser: UserType }
) => {
  // if (!Users.isAdmin(currentUser)) {
  //   throw new Error('You cannot perform this operation');
  // }
  const results: Array<{
    normalizedResponseId?: string;
    responseId?: string;
    normalizedFields?: Array<any>;
  }> = [];

  if (!currentUser.isAdmin) throw new Error("Non admin cannot normalize ids");

  const { ids } = args;
  // TODO: use Response model and connector instead
  const responses = await ResponseAdminMongooseModel.find({
    _id: { $in: ids },
  });
  for (const document of responses) {
    const { _id } = document;
    const normalization = await normalizeResponse({ document, verbose: true });
    if (!normalization) {
      throw new Error(
        `Could not normalize response ${JSON.stringify(document)}`
      );
    }
    results.push(normalization);
  }
  return results;
};

export const normalizeIdsTypeDefs = "normalizeIds(ids: [String]): [JSON]";

/*

Normalization

*/
const defaultLimit = 999;
const isSimulation = false;
const verbose = false;

export const normalizeSurvey = async (
  root,
  args,
  { currentUser }: { currentUser: UserType }
) => {
  const {
    surveyId,
    fieldId,
    startFrom = 0,
    limit = defaultLimit,
    onlyUnnormalized,
  } = args;
  const startAt = new Date();
  let progress = 0;

  const metadata: {
    surveyId: string;
    normalizedDocuments: any[];
    duration?: number;
    count?: number;
    errorCount: number;
  } = { surveyId, normalizedDocuments: [], errorCount: 0 };

  if (!currentUser.isAdmin)
    throw new Error("Non admin cannot normalize surveys");

  const entities = await getOrFetchEntities();

  // TODO: use Response model and connector instead

  const selector = await getSelector(surveyId, fieldId, onlyUnnormalized);
  const responses = await ResponseAdminMongooseModel.find(selector)
    .skip(startFrom)
    .limit(limit);
  const count = responses.length;
  metadata.count = count;
  const tickInterval = Math.round(count / 200);

  console.log(
    `// Renormalizing survey ${surveyId}${
      fieldId ? ` (field [${fieldId}])` : ""
    }… Found ${count} responses to renormalize (startFrom: ${startFrom}, limit: ${limit}). (${startAt})`
  );

  for (const response of responses) {
    const normalizationResult = await normalizeResponse({
      document: response,
      verbose,
      isSimulation,
      entities,
      fieldId,
    });

    progress++;
    if (limit > 1000 && progress % tickInterval === 0) {
      console.log(`  -> Normalized ${progress}/${count} responses…`);
    }

    if (!normalizationResult) {
      metadata.errorCount++;
      metadata.normalizedDocuments.push({
        responseId: response._id,
        errors: [
          {
            type: "normalization_failed",
            documentId: response._id,
          },
        ],
      });
    } else {
      if (normalizationResult.errors.length > 0) {
        metadata.errorCount += normalizationResult.errors.length;
      }
      metadata.normalizedDocuments.push(
        pick(normalizationResult, [
          "errors",
          "responseId",
          "normalizedResponseId",
          "normalizedFieldsCount",
          "prenormalizedFieldsCount",
          "regularFieldsCount",
        ])
      );
    }
  }

  const endAt = new Date();
  const duration = Math.ceil((endAt.valueOf() - startAt.valueOf()) / 1000);
  // duration in seconds
  metadata.duration = duration;
  console.log(
    `-> Done renormalizing ${count} responses in survey ${surveyId}. (${endAt}) - ${
      duration / 60
    } min`
  );

  return metadata;
};

export const normalizeSurveyTypeDefs =
  "normalizeSurvey(surveyId: String, fieldId: String, startFrom: Int, limit: Int, onlyUnnormalized: Boolean): JSON";

/*

Get survey metadata

*/
export const getSurveyMetadata = async (
  root,
  args,
  { currentUser }: { currentUser: UserType }
) => {
  const { surveyId, fieldId, onlyUnnormalized } = args;
  if (!currentUser.isAdmin) throw new Error("Non admin cannot do this");

  const selector = await getSelector(surveyId, fieldId, onlyUnnormalized);

  // TODO: use Response model and connector instead
  const responsesCount = await ResponseAdminMongooseModel.count(selector);
  return { responsesCount };
};

export const getSurveyMetadataTypeDefs =
  "getSurveyMetadata(surveyId: String, fieldId: String, onlyUnnormalized: Boolean): JSON";

/*

Unnormalized Fields

*/
export const unnormalizedFields = async (root, { surveyId, fieldId }) => {
  // console.log(`// unnormalizedFields ${surveySlug} ${fieldName}`);
  if (fieldId) {
    const { responses, rawFieldPath } = await getUnnormalizedResponses(
      surveyId,
      fieldId
    );

    const cleanResponses = responses.map((r) => {
      return {
        _id: r._id,
        responseId: r.responseId,
        value: get(r, rawFieldPath),
      };
    });

    return cleanResponses;
  } else {
    return [];
  }
};

export const unnormalizedFieldsTypeDefs =
  "unnormalizedFields(surveyId: String, fieldId: String): [JSON]";

/*

Reset Normalization

TODO

*/
export const resetNormalization = async (root, { surveyId }) => {};

export const resetNormalizationTypeDefs =
  "resetNormalization(surveyId: String): [JSON]";
