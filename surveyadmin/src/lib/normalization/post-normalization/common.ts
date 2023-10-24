import { generateSourceField } from "../helpers/generateSourceField";
import { deleteDuplicates } from "../helpers/deleteDuplicates";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import * as editions from "./editions";

export type RunPostNormalizationOperationOptions = {
  survey: SurveyMetadata;
  edition: EditionMetadata;
};

export interface PostNormalizationOperationOptions
  extends RunPostNormalizationOperationOptions {
  operationResults: PostNormalizationOperationResult[];
}

export type PostNormalizationOperationResult = {
  id: string;
  duration: number;
  result: any;
};

export const runPostNormalizationOperations = async (
  options: RunPostNormalizationOperationOptions
) => {
  const { survey, edition } = options;
  const operationResults = [];
  console.log(
    `⛰️ Starting post-normalization operations for edition ${edition.id}… `
  );
  const callbackFunction = editions[edition.id];
  if (callbackFunction) {
    await callbackFunction({ ...options, operationResults });
  } else {
    await runOperation(generateSourceField, options, operationResults);
    await runOperation(deleteDuplicates, options, operationResults);
  }
  await console.log(
    `⛰️ Finished post-normalization operations for edition ${edition.id} `
  );
  console.log(operationResults);
};

export const runOperation = async (
  operation: any,
  options: any,
  operationResults: PostNormalizationOperationResult[]
) => {
  console.log(`// Starting post-normalization operation ${operation.name}…`);
  const startAt = new Date();
  const result = await operation(options);
  const endAt = new Date();
  operationResults.push({
    id: operation.name,
    result,
    duration: endAt.getTime() - startAt.getTime(),
  });
};
