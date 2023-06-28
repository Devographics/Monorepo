import { normalizeResponse } from "../normalize";
import { getBulkOperation } from "../helpers";
import pick from "lodash/pick.js";
import { getNormResponsesCollection } from "@devographics/mongo";
import { fetchEntities } from "~/lib/api/fetch";
import { ResponseDocument, SurveyMetadata } from "@devographics/types";
import { logToFile } from "@devographics/helpers";
import { NormalizeInBulkResult, BulkOperation } from "../types";

/*

Normalization

*/
export const defaultLimit = 999;
const isSimulation = true;
const verbose = true;

/*

We can normalize:

A) a specific set of documents (if responsesIds is passed)
B) a specific question on *all* documents (if questionId) is passed
C) *all* questions on *all* documents (if neither is passed)

*/
export const normalizeInBulk = async ({
  survey,
  responses,
  args,
  limit,
  questionId,
  isRenormalization = false,
}: {
  survey: SurveyMetadata;
  responses: ResponseDocument[];
  args: any;
  limit?: number;
  questionId?: string;
  isRenormalization?: boolean;
}) => {
  const startAt = new Date();
  let progress = 0,
    discardedCount = 0;
  const count = responses.length;
  const tickInterval = Math.round(count / 200);

  // if no fieldId is defined then we are normalizing the entire document and want
  // to replace everything instead of updating a single field
  const isReplace = !questionId;

  const mutationResult: NormalizeInBulkResult = {
    ...args,
    normalizedDocuments: [],
    errorCount: 0,
  };

  const bulkOperations: BulkOperation[] = [];

  const entities = await fetchEntities();

  // console.log(JSON.stringify(selector, null, 2))

  // iterate over responses to populate bulkOperations array
  for (const response of responses) {
    const normalizationResult = await normalizeResponse({
      document: response,
      verbose,
      isSimulation,
      entities,
      questionId,
      isBulk: true,
      isRenormalization,
    });

    progress++;
    if (limit && limit > 1000 && progress % tickInterval === 0) {
      console.log(`  -> Normalized ${progress}/${count} responses…`);
    }
    await logToFile("normalizationResult.json", normalizationResult, {
      mode: "overwrite",
    });
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
          "normalizedFields",
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

  const normResponsesCollection = await getNormResponsesCollection(survey);
  try {
    if (!isSimulation) {
      console.log(`-> Now starting bulk write…`);
      const operationResult = await normResponsesCollection.bulkWrite(
        bulkOperations
      );
      console.log("// operationResult");
      console.log(operationResult);
    }
    await logToFile("bulkOperations.json", bulkOperations, {
      mode: "overwrite",
    });
    // mutationResult.operationResult = operationResult.result;
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
    `👍 Normalized ${progress - discardedCount} responses ${
      discardedCount > 0 ? `(${discardedCount} responses discarded)` : ""
    }. (${endAt}) - ${duration}s`
  );

  return mutationResult;
};
