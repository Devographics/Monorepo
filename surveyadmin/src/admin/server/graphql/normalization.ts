import get from "lodash/get.js";
import { normalizeResponse } from "../normalization/normalize";
import {
  getSelector,
  getUnnormalizedResponses,
  getBulkOperation,
} from "../normalization/helpers";
import { UserType } from "~/core/models/user";
import { ResponseAdminMongooseModel } from "@devographics/core-models/server";
import { getOrFetchEntities } from "~/modules/entities/server";
import pick from "lodash/pick.js";
import { NormalizedResponseMongooseModel } from "~/admin/models/normalized_responses/model.server";

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

interface BulkOperation {
  updateMany?: any;
  replaceOne?: any;
}

interface NormalizedDocumentMetadata {
  responseId: string;
  errors?: any[];
  normalizedResponseId?: string;
  normalizedFieldsCount?: number;
  prenormalizedFieldsCount?: number;
  regularFieldsCount?: number;
}

interface NormalizeSurveyResult {
  surveyId: string;
  normalizedDocuments: NormalizedDocumentMetadata[];
  duration?: number;
  count?: number;
  errorCount: number;
  operationResult?: any;
  discardedCount?: number;
}

export const normalizeSurvey = async (
  root,
  args,
  { currentUser }: { currentUser: UserType }
) => {
  if (!currentUser.isAdmin) {
    throw new Error("Non admin cannot normalize surveys");
  }

  const {
    surveyId,
    fieldId,
    startFrom = 0,
    limit = defaultLimit,
    onlyUnnormalized,
  } = args;
  const startAt = new Date();
  let progress = 0,
    discardedCount = 0;

  const bulkOperations: BulkOperation[] = [];

  // if no fieldId is defined then we are normalizing the entire document and want
  // to replace everything instead of updating a single field
  const isReplace = !fieldId;

  const mutationResult: NormalizeSurveyResult = {
    surveyId,
    normalizedDocuments: [],
    errorCount: 0,
  };

  const entities = await getOrFetchEntities();

  // TODO: use Response model and connector instead

  // first, get all the responses we're going to operate on
  const selector = await getSelector(surveyId, fieldId, onlyUnnormalized);
  const responses = await ResponseAdminMongooseModel.find(selector, null, {
    sort: {
      createdAt: 1,
    },
  })
    .skip(startFrom)
    .limit(limit);
  const count = responses.length;
  mutationResult.count = count;
  const tickInterval = Math.round(count / 200);

  console.log(
    `// Renormalizing survey ${surveyId}${
      fieldId ? ` (field [${fieldId}])` : ""
    }… Found ${count} responses to renormalize (startFrom: ${startFrom}, limit: ${limit}). (${startAt})`
  );

  // iterate over responses to populate bulkOperations array
  for (const response of responses) {
    const normalizationResult = await normalizeResponse({
      document: response,
      verbose,
      isSimulation,
      entities,
      fieldId,
      isBulk: true,
    });

    progress++;
    if (limit > 1000 && progress % tickInterval === 0) {
      console.log(`  -> Normalized ${progress}/${count} responses…`);
    }

    if (!normalizationResult) {
      mutationResult.errorCount++;
      mutationResult.normalizedDocuments.push({
        responseId: response._id,
        errors: [
          {
            type: "normalization_failed",
          },
        ],
      });
    } else {
      // keep track of total error count
      if (normalizationResult.errors.length > 0) {
        mutationResult.errorCount += normalizationResult.errors.length;
      }

      // create a list of metadata about normalization process to return as mutation result
      mutationResult.normalizedDocuments.push(
        pick(normalizationResult, [
          "errors",
          "responseId",
          "normalizedResponseId",
          "normalizedFieldsCount",
          "prenormalizedFieldsCount",
          "regularFieldsCount",
        ])
      );

      // if normalization was valid, add it to bulk operations array
      if (!normalizationResult.discard) {
        const { selector, modifier } = normalizationResult;
        const operation = getBulkOperation(selector, modifier, isReplace);
        bulkOperations.push(operation);
      } else {
        discardedCount++;
      }
    }
  }

  /*

  Note: when renormalizing a specific field with onlyUnnormalized=false, *all* responses where
  that field exists will be selected. This might include responses who do not have a corresponding
  normalized response document (for example, because they have been discarded for being empty).

  Because bulkWrite() will run with upsert=false when normalizing a specific field, 
  these responses will not be created.

  Make sure to only renormalize a specific field *after* having normalized all fields for all documents.

  */
  // see https://www.mongodb.com/docs/manual/reference/method/db.collection.bulkWrite
  console.log(`-> Now starting bulk write…`);
  try {
    const operationResult = await NormalizedResponseMongooseModel.bulkWrite(
      bulkOperations
    );
    mutationResult.operationResult = operationResult.result;
    mutationResult.discardedCount = discardedCount;
  } catch (error) {
    console.log("// Bulk write error");
    throw error;
  }

  const endAt = new Date();
  const duration = Math.ceil((endAt.valueOf() - startAt.valueOf()) / 1000);
  // duration in seconds
  mutationResult.duration = duration;
  console.log(
    `-> Normalized ${limit - discardedCount} responses in survey ${surveyId} ${
      discardedCount > 0
        ? `(${discardedCount}/${limit} responses discarded)`
        : ""
    }. (${endAt}) - ${duration}s`
  );

  return mutationResult;
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
