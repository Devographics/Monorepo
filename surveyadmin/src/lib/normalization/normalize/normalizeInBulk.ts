import { normalizeDocument } from "./normalizeDocument";
import { getBulkOperations } from "./helpers";
import { generateEntityRules } from "./generateEntityRules";
import { getNormResponsesCollection } from "@devographics/mongo";
import { fetchEntities } from "@devographics/fetch";
import {
  EditionMetadata,
  ResponseDocument,
  SurveyMetadata,
} from "@devographics/types";
import { logToFile } from "@devographics/debug";
import {
  NormalizeInBulkResult,
  BulkOperation,
  NormalizedDocumentMetadata,
  DocumentGroups,
  NormalizationResultSuccessEx,
  NormalizationResultTypes,
} from "../types";
import { getEditionSelector } from "../helpers/getSelectors";

/*

Normalization

*/
export const defaultLimit = 999;
const isSimulation = false;
const verbose = false;

interface NormalizeInBulkOption {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  responses: ResponseDocument[];
  limit?: number;
  questionId?: string;
  isRenormalization?: boolean;
  verbose?: boolean;
}

/*

We can normalize:

A) a specific set of documents (if responsesIds is passed)
B) a specific question on *all* documents (if questionId) is passed
C) *all* questions on *all* documents (if neither is passed)

*/
export const normalizeInBulk = async (options: NormalizeInBulkOption) => {
  const {
    survey,
    edition,
    responses,
    limit,
    questionId,
    isRenormalization = false,
    verbose = false,
  } = options;
  const startAt = new Date();
  const timestamp = startAt.toISOString();

  await logToFile(`normalizeInBulk/${timestamp}_options.json`, options);

  let progress = 0;
  const count = responses.length;
  const tickInterval = Math.round(count / 200);

  // if no fieldId is defined then we are normalizing the entire document and want
  // to replace everything instead of updating a single field
  const isReplace = !questionId;

  let allDocuments: NormalizedDocumentMetadata[] = [];

  const mutationResult: NormalizeInBulkResult = {
    normalizedDocuments: [],
    unmatchedDocuments: [],
    unnormalizableDocuments: [],
    errorDocuments: [],
    emptyDocuments: [],
    discardedCount: 0,
    totalDocumentCount: 0,
    errorCount: 0,
    limit,
    isSimulation,
  };

  const bulkOperations: BulkOperation[] = [];

  const { data: entities } = await fetchEntities();
  const entityRules = generateEntityRules(entities);

  // console.log(JSON.stringify(selector, null, 2))

  // iterate over responses to populate bulkOperations array
  for (const response of responses) {
    const normalizationResult = await normalizeDocument({
      response,
      verbose,
      isSimulation,
      survey,
      edition,
      entities,
      entityRules,
      questionId,
      isBulk: true,
      isRenormalization,
    });

    progress++;
    if (limit && limit > 1000 && progress % tickInterval === 0) {
      console.log(`  -> Normalized ${progress}/${count} responses…`);
    }

    if (normalizationResult.type === NormalizationResultTypes.ERROR) {
      mutationResult.errorCount += normalizationResult.errors.length;
      allDocuments.push({
        responseId: response._id,
        errors: normalizationResult.errors,
      });
    } else if (normalizationResult.type === NormalizationResultTypes.EMPTY) {
      allDocuments.push({
        responseId: response._id,
        empty: true,
      });
    } else {
      // if normalization was valid, add it to array of all documents
      const { responseId, normalizedResponse, normalizedFields, counts } =
        normalizationResult as NormalizationResultSuccessEx;

      /* 
      
      Note: we only need to include all normalizedFields in the mutation response, 
      regular/comment/prenormalized fields do not need to be returned back to the client
      since they are just copied over. 

      */
      const resultDocument = {
        // errors,
        responseId,
        normalizedResponseId: normalizedResponse._id,
        normalizedFields,
        counts,
      };
      allDocuments.push(resultDocument);

      if (normalizationResult.discard) {
        /* 
        
        Note: a document being marked as "discard" doesn't always mean it's empty,
        it just means it should not trigger a database operation during this normalization

        */
        mutationResult.discardedCount++;
      } else {
        // add to bulk operations array
        const { selector, modifier } = normalizationResult;
        const operations = getBulkOperations({
          selector,
          modifier,
          isReplace,
        });
        bulkOperations.push(...operations);
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

      await logToFile(
        `normalizeInBulk/${timestamp}_bulkOperations.json`,
        bulkOperations
      );

      const operationResult = await normResponsesCollection.bulkWrite(
        bulkOperations
      );
      console.log("// operationResult");
      console.log(operationResult);

      if (operationResult.insertedCount > 1) {
        // if we inserted more than one document, make sure we
        // delete any duplicates we might've introduced
        await deleteDuplicates({ survey, edition });
      }
    }
  } catch (error) {
    console.log("// Bulk write error");
    // console.log(JSON.stringify(bulkOperations, null, 2))
    throw error;
  }

  const endAt = new Date();
  const duration = Math.ceil((endAt.valueOf() - startAt.valueOf()) / 1000);
  // duration in seconds
  mutationResult.duration = duration;

  /*

  Sort documents in different "buckets" to help with logging

  */
  allDocuments = allDocuments.map((doc) => {
    let group;
    if (doc.empty) {
      group = DocumentGroups.EMPTY;
    } else if (doc.errors && doc.errors.length > 0) {
      group = DocumentGroups.ERROR;
    } else {
      if (doc.normalizedFields?.some((field) => field.raw)) {
        // doc has normalizable fields that contain an answer
        if (
          doc.normalizedFields?.every((field) => field.normTokens.length > 0)
        ) {
          // every question has had a match
          group = DocumentGroups.NORMALIZED;
        } else {
          // there are unmatched questions
          group = DocumentGroups.UNMATCHED;
        }
      } else {
        // document did not contain any normalizable fields
        group = DocumentGroups.UNNORMALIZABLE;
      }
    }
    return { ...doc, group };
  });

  for (const groupKey in DocumentGroups) {
    const groupName = DocumentGroups[groupKey];
    mutationResult[`${groupName}Documents`] = allDocuments.filter(
      (d) => d.group === groupName
    );
  }

  mutationResult.totalDocumentCount = allDocuments.length;

  await logToFile(
    `normalizeInBulk/${timestamp}_allDocuments.json`,
    allDocuments
  );
  await logToFile(
    `normalizeInBulk/${timestamp}_mutationResult.json`,
    mutationResult
  );

  console.log(
    `👍 Normalized ${progress - mutationResult.discardedCount} responses ${
      mutationResult.discardedCount > 0
        ? `(${mutationResult.discardedCount} responses discarded)`
        : ""
    }. (${endAt}) - ${duration}s`
  );

  return mutationResult;
};

/*

Remove any duplicates, etc.

*/
export const deleteDuplicates = async ({
  survey,
  edition,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
}) => {
  console.log("⛰️ Cleaning up duplicates…");
  const normResponsesCollection = await getNormResponsesCollection(survey);

  const selector = await getEditionSelector({ survey, edition });
  /*

  Sample pipeline output item:

  {
    _id: "TCsOhSt6uz1tJXRoecz7s", // responseId field
    count: 2, // only keep responseId which have 2+ matching _ids
    ids: ["gByqCv6-HU0C2nTFP4MRg", "11UkYx4L7-EKnkD73U5fu"] // matching _ids
  }

  */
  const pipeline = [
    {
      $match: { ...selector, responseId: { $ne: null } },
    },
    {
      $group: {
        _id: "$responseId",
        // Group by responseId field
        count: {
          $sum: 1,
        },
        // Count the number of documents with the same responseId
        ids: {
          $push: "$_id",
        }, // Store the IDs of documents with the same responseId
      },
    },
    {
      $match: {
        count: {
          $gt: 1,
        }, // Filter groups with count greater than 1 (duplicates)
      },
    },
  ];

  const duplicates = await normResponsesCollection
    .aggregate(pipeline)
    .toArray();

  // extract the second _id for each responseId (the _id of the duplicate)
  const duplicateIds = duplicates.map((d) => d.ids[1]);
  const operation = await normResponsesCollection.deleteMany({
    _id: { $in: duplicateIds },
  });
  console.log(`⛰️ Deleted ${operation.deletedCount} duplicate responses.`);
  return operation.deletedCount;
};
