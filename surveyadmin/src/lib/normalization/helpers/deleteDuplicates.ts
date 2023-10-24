import { getNormResponsesCollection } from "@devographics/mongo";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { getEditionSelector } from "./getSelectors";

/*

Remove any duplicates, etc.

*/

export async function deleteDuplicates({
  survey,
  edition,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
}) {
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
}
