import { getEditionSelector, getSelector } from "../helpers/getSelectors";
import {
  getNormResponsesCollection,
  getRawResponsesCollection,
} from "@devographics/mongo";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { normalizeInBulk, defaultLimit } from "../normalize/normalizeInBulk";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { ResponseDocument } from "@devographics/types";
import { NormalizedResponseDocument } from "../types";

export type AddManualNormalizationArgs = {
  responseId: string;
  normRespId: string;
  surveyId: string;
  editionId: string;
  questionId?: string;
  tokens: string[];
};

export type AddManualNormalizationResult = {};
/**

Normalize all questions for a specific edition

*/
export const addManualNormalizations = async (
  args: AddManualNormalizationArgs
) => {
  const { surveyId, editionId, questionId, tokens, responseId, normRespId } =
    args;
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
  const rawResponsesCollection =
    await getRawResponsesCollection<ResponseDocument>(survey);

  console.log(
    `⛰️ Adding manual normalizations for ${editionId}/${questionId}/${responseId}: ${tokens.join(
      ", "
    )}`
  );
  console.log(args);
};
