/*

Rename processed field name

*/
import { getNormResponsesCollection } from "@devographics/mongo";

// how many bulk operation to perform in one go
const operationsPerStep = 1000;

export async function renameProcessedField({
  surveyId,
  editionId,
  oldSectionId,
  newSectionId = oldSectionId,
  oldFieldId,
  newFieldId = oldFieldId,
}: {
  surveyId: string;
  editionId: string;
  oldSectionId: string;
  newSectionId: string;
  oldFieldId: string;
  newFieldId: string;
}) {
  const results: any[] = [];

  const normResponses = await getNormResponsesCollection();

  const oldFieldPath = `${oldSectionId}.${oldFieldId}`;
  const newFieldPath = `${newSectionId}.${newFieldId}`;

  const selector = {
    editionId,
    [oldFieldPath]: { $exists: true },
  };
  const operator = {
    [oldFieldPath]: newFieldPath,
  };

  const result = await normResponses.updateMany(selector, {
    $rename: operator,
  });
  if (result.modifiedCount > 0) {
    results.push({ operator, result });
  }
  console.log(results);
  return results;
}
