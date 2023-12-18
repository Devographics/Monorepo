import { deleteDuplicates } from "../helpers/deleteDuplicates";
import { generateSourceField } from "../helpers/generateSourceField";
import { PostNormalizationOperationOptions, runOperation } from "./common";
import { getNormResponsesCollection } from "@devographics/mongo";

export const td2023 = async (options: PostNormalizationOperationOptions) => {
  const { operationResults } = options;
  await runOperation(generateSourceField, options, operationResults);
  await runOperation(deleteDuplicates, options, operationResults);
  await runOperation(removeNonJapanResponses, options, operationResults);
  await runOperation(removeOver24HoursPerDay, options, operationResults);
  return operationResults;
};

export async function removeNonJapanResponses({
  survey,
  edition,
}: PostNormalizationOperationOptions) {
  const normalizedResponses = await getNormResponsesCollection();
  const selector = {
    editionId: edition.id,
    "user_info.japan_province.choices": "outside_of_japan",
  };
  return await normalizedResponses.deleteMany(selector);
}

export async function removeOver24HoursPerDay({
  edition,
}: PostNormalizationOperationOptions) {
  const normalizedResponses = await getNormResponsesCollection();
  const path = "job_info.hours_per_day.choices";
  const selector = {
    editionId: edition.id,
    [path]: { $gt: 24 },
  };
  return await normalizedResponses.updateMany(selector, {
    $unset: { [path]: 1 },
  });
}
