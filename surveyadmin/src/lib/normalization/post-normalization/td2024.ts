import { getNormResponsesCollection } from "@devographics/mongo";
import { deleteDuplicates } from "../helpers/deleteDuplicates";
import { generateSourceField } from "../helpers/generateSourceField";
import { PostNormalizationOperationOptions, runOperation } from "./common";
import { removeNonJapanResponses } from "./td2023";

export const td2024 = async (options: PostNormalizationOperationOptions) => {
  const { operationResults } = options;
  await runOperation(generateSourceField, options, operationResults);
  await runOperation(deleteDuplicates, options, operationResults);
  await runOperation(removeNonJapanResponses, options, operationResults);
  await runOperation(removeOve140HoursPerWeek, options, operationResults);
  return operationResults;
};

export async function removeOve140HoursPerWeek({
  edition,
}: PostNormalizationOperationOptions) {
  const normalizedResponses = await getNormResponsesCollection();
  const path = "job_info.work_hours_per_week.choices";
  const selector = {
    editionId: edition.id,
    [path]: { $gt: 140 },
  };
  return await normalizedResponses.updateMany(selector, {
    $unset: { [path]: 1 },
  });
}
