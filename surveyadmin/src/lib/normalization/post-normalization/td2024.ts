import { deleteDuplicates } from "../helpers/deleteDuplicates";
import { generateSourceField } from "../helpers/generateSourceField";
import { PostNormalizationOperationOptions, runOperation } from "./common";
import { removeNonJapanResponses } from "./td2023";

export const td2024 = async (options: PostNormalizationOperationOptions) => {
  const { operationResults } = options;
  await runOperation(generateSourceField, options, operationResults);
  await runOperation(deleteDuplicates, options, operationResults);
  await runOperation(removeNonJapanResponses, options, operationResults);
  return operationResults;
};
