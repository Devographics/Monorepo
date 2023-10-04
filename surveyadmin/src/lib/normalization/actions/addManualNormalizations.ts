import { getEditionSelector, getSelector } from "../helpers/getSelectors";
import {
  getNormResponsesCollection,
  getRawResponsesCollection,
} from "@devographics/mongo";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { normalizeInBulk, defaultLimit } from "../normalize/normalizeInBulk";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import {
  ResponseDocument,
  CustomNormalizationDefinition,
} from "@devographics/types";
import { NormalizedResponseDocument } from "../types";
import uniq from "lodash/uniq";

export type AddManualNormalizationArgs = {
  responseId: string;
  normRespId: string;
  surveyId: string;
  editionId: string;
  questionId: string;
  tokens: string[];
  rawValue: string;
  rawPath: string;
};

/**

Normalize all questions for a specific edition

*/
export const addManualNormalizations = async (
  args: AddManualNormalizationArgs
) => {
  const {
    surveyId,
    editionId,
    questionId,
    tokens,
    responseId,
    rawValue,
    rawPath,
    normRespId,
  } = args;
  const startAt = new Date();

  const { data: surveys } = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    throw new Error(`Could not find survey for surveyId ${surveyId}`);
  }

  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
    shouldGetFromCache: false,
  });
  if (!edition) {
    throw new Error(`Could not find edition for editionId ${editionId}`);
  }
  console.log(
    `⛰️ Adding manual normalizations for ${editionId}/${questionId}/${responseId}: ${tokens.join(
      ", "
    )}`
  );

  const rawResponsesCollection =
    await getRawResponsesCollection<ResponseDocument>(survey);

  // first, get the response we're going to operate on
  const response = await rawResponsesCollection.findOne({ _id: responseId });

  if (!response) {
    throw new Error(
      `addManualNormalizations: no response document foudn for _id ${responseId}`
    );
  }

  const normalizationDefinition: CustomNormalizationDefinition = {
    rawPath,
    rawValue,
    tokens,
  };

  const customNormalizations: CustomNormalizationDefinition[] =
    response.customNormalizations || [];
  const existingNormalizationDefinition = customNormalizations.find(
    (n) => n.rawPath === rawPath
  );
  if (existingNormalizationDefinition) {
    // if a custom norm. definition already exists for this field, add new tokens to it
    // (removing duplicates in the process)
    existingNormalizationDefinition.tokens = uniq([
      ...existingNormalizationDefinition.tokens,
      ...tokens,
    ]);
  } else {
    // else, add new norm. definition to customNormalizations array
    customNormalizations.push(normalizationDefinition);
  }

  const selector = { _id: responseId };
  const operation = {
    $set: { customNormalizations },
  };
  const updateResult = await rawResponsesCollection.updateOne(
    selector,
    operation
  );

  const responses = [{ ...response, customNormalizations }];

  const mutationResult = await normalizeInBulk({
    survey,
    edition,
    responses,
    questionId,
    isRenormalization: true,
    verbose: true,
  });

  return mutationResult;
};
