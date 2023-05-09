import get from "lodash/get.js";
import { normalizeResponse } from "../normalization/normalize";
import {
  getSelector,
  getUnnormalizedResponses,
  getBulkOperation,
} from "../normalization/helpers";
import { UserType } from "~/core/models/user";
// import { ResponseAdminMongooseModel } from "@devographics/core-models/server";
import { ResponseMongooseModel } from "~/modules/responses/model.server";
import { getOrFetchEntities } from "~/modules/entities/server";
import pick from "lodash/pick.js";
import { NormalizedResponseMongooseModel } from "~/admin/models/normalized_responses/model.server";
import {
  getNormResponsesCollection,
  getRawResponsesCollection,
} from "../mongo";
import { loadOrGetSurveys } from "~/modules/surveys/load";

/*

Normalization

*/
// export const normalizeIds = async (
//   root,
//   args,
//   { currentUser }: { currentUser: UserType }
// ) => {
//   // if (!Users.isAdmin(currentUser)) {
//   //   throw new Error('You cannot perform this operation');
//   // }
//   const results: Array<{
//     normalizedResponseId?: string;
//     responseId?: string;
//     normalizedFields?: Array<any>;
//   }> = [];

//   if (!currentUser.isAdmin) throw new Error("Non admin cannot normalize ids");

//   const { ids } = args;
//   // TODO: use Response model and connector instead
//   const responses = await ResponseMongooseModel.find({
//     _id: { $in: ids },
//   });
//   for (const document of responses) {
//     const { _id } = document;
//     const normalization = await normalizeResponse({
//       document,
//       verbose: true,
//       isSimulation: true,
//     });
//     if (!normalization) {
//       throw new Error(
//         `Could not normalize response ${JSON.stringify(document)}`
//       );
//     }
//     results.push(normalization);
//   }
//   // console.log("// normalizeIds");
//   // console.log(JSON.stringify(results, null, 2));
//   return results;
// };

// export const normalizeIdsTypeDefs = "normalizeIds(ids: [String]): [JSON]";

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
  editionId: string;
  normalizedDocuments: NormalizedDocumentMetadata[];
  duration?: number;
  count?: number;
  errorCount: number;
  operationResult?: any;
  discardedCount?: number;
}

type NormalizeResponsesArgs = {
  editionId: string;
  questionId?: string;
  responsesIds?: string[];
  startFrom?: number;
  limit?: number;
  onlyUnnormalized?: boolean;
};
/*

We can normalize:

A) a specific set of documents (if responsesIds is passed)
B) a specific question on *all* documents (if questionId) is passed
C) *all* questions on *all* documents (if neither is passed)

*/
export const normalizeResponses = async (
  root,
  args: NormalizeResponsesArgs,
  { currentUser }: { currentUser: UserType }
) => {
  if (!currentUser.isAdmin) {
    throw new Error("Non admin cannot normalize surveys");
  }

  const {
    editionId,
    questionId,
    responsesIds,
    startFrom = 0,
    limit = defaultLimit,
    onlyUnnormalized,
  } = args;
  const startAt = new Date();
  let progress = 0,
    discardedCount = 0;

  const surveys = await loadOrGetSurveys();
  const survey = surveys.find((s) =>
    s.editions.some((e) => e.id === editionId)
  );
  const edition = survey?.editions.find((e) => e.id === editionId);

  const bulkOperations: BulkOperation[] = [];

  // if no fieldId is defined then we are normalizing the entire document and want
  // to replace everything instead of updating a single field
  const isReplace = !questionId;

  const mutationResult: NormalizeSurveyResult = {
    editionId,
    normalizedDocuments: [],
    errorCount: 0,
  };

  const entities = await getOrFetchEntities({ forceLoad: true });

  // TODO: use Response model and connector instead

  // first, get all the responses we're going to operate on
  const selector = await getSelector({
    editionId,
    questionId,
    responsesIds,
    onlyUnnormalized,
  });

  const rawResponsesCollection = await getRawResponsesCollection(survey);

  const responses = await rawResponsesCollection
    .find(selector, null, {
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
    `// Renormalizing survey ${editionId}${
      questionId ? ` (field [${questionId}])` : ""
    }… Found ${count} responses to renormalize (startFrom: ${startFrom}, limit: ${limit}). (${startAt})`
  );
  // console.log(JSON.stringify(selector, null, 2))

  // iterate over responses to populate bulkOperations array
  for (const response of responses) {
    const normalizationResult = await normalizeResponse({
      document: response,
      verbose,
      isSimulation,
      entities,
      fieldId: questionId,
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

  const normResponsesCollection = await getNormResponsesCollection(survey);
  try {
    const operationResult = await normResponsesCollection.bulkWrite(
      bulkOperations
    );
    mutationResult.operationResult = operationResult.result;
    mutationResult.discardedCount = discardedCount;
  } catch (error) {
    console.log("// Bulk write error");
    // console.log(JSON.stringify(bulkOperations, null, 2))
    throw error;
  }

  const endAt = new Date();
  const duration = Math.ceil((endAt.valueOf() - startAt.valueOf()) / 1000);
  // duration in seconds
  mutationResult.duration = duration;
  console.log(
    `👍 Normalized ${limit - discardedCount} responses in survey ${editionId} ${
      discardedCount > 0
        ? `(${discardedCount}/${limit} responses discarded)`
        : ""
    }. (${endAt}) - ${duration}s`
  );

  return mutationResult;
};

export const normalizeResponsesTypeDefs =
  "normalizeResponses(editionId: String, responsesIds: [String], questionId: String, startFrom: Int, limit: Int, onlyUnnormalized: Boolean): JSON";

/*

Get survey metadata

*/
type GetSurveyMetadataArgs = {
  editionId: string;
  questionId?: string;
  onlyUnnormalized?: boolean;
};
export const getSurveyMetadata = async (
  root,
  args: GetSurveyMetadataArgs,
  { currentUser }: { currentUser: UserType }
) => {
  const { editionId, questionId, onlyUnnormalized } = args;
  if (!currentUser.isAdmin) throw new Error("Non admin cannot do this");

  const surveys = await loadOrGetSurveys();
  const survey = surveys.find((s) =>
    s.editions.some((e) => e.id === editionId)
  );

  const selector = await getSelector({
    editionId,
    questionId,
    onlyUnnormalized,
  });

  const rawResponsesCollection = await getRawResponsesCollection(survey);
  const responsesCount = await rawResponsesCollection.count(selector);
  return { responsesCount };
};

export const getSurveyMetadataTypeDefs =
  "getSurveyMetadata(editionId: String, questionId: String, onlyUnnormalized: Boolean): JSON";

/*

Unnormalized Fields

*/
export const unnormalizedFields = async (root, { editionId, questionId }) => {
  // console.log(`// unnormalizedFields ${surveySlug} ${fieldName}`);
  if (questionId) {
    const { responses, rawFieldPath } = await getUnnormalizedResponses(
      editionId,
      questionId
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
  "unnormalizedFields(editionId: String, questionId: String): [JSON]";

/*

Reset Normalization

TODO

*/
export const resetNormalization = async (root, { surveyId }) => {};

export const resetNormalizationTypeDefs =
  "resetNormalization(editionId: String): [JSON]";
