import { deleteDuplicates } from "../helpers/deleteDuplicates";
import { generateSourceField } from "../helpers/generateSourceField";
import { PostNormalizationOperationOptions, runOperation } from "./common";
import { removeNonJapanResponses } from "./td2023";

export const td2025 = async (options: PostNormalizationOperationOptions) => {
  const { operationResults } = options;
  await runOperation(removeNonJapanResponses, options, operationResults);
  await runOperation(generateSourceField, options, operationResults);
  await runOperation(deleteDuplicates, options, operationResults);
  return operationResults;
};
