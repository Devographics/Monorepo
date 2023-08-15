import { getEditionSelector, getSelector } from "../helpers/getSelectors";
import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { normalizeInBulk, defaultLimit } from "../normalize/normalizeInBulk";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";

export type NormalizeEditionArgs = {
  surveyId: string;
  editionId: string;
  startFrom?: number;
  limit?: number;
  onlyUnnormalized?: boolean;
};

/*

Normalize all questions for a specific edition

*/
export const normalizeEdition = async (args: NormalizeEditionArgs) => {
  const {
    surveyId,
    editionId,
    startFrom = 0,
    limit = defaultLimit,
    onlyUnnormalized,
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

  const rawResponsesCollection = await getRawResponsesCollection(survey);

  const selector = await getEditionSelector({
    survey,
    edition,
  });

  const responses = await rawResponsesCollection
    .find(selector, {
      sort: {
        createdAt: 1,
      },
      skip: startFrom,
      limit,
    })
    .toArray();

  console.log(
    `⛰️ Renormalizing all questions for edition ${editionId}… Found ${responses.length} responses to renormalize (startFrom: ${startFrom}, limit: ${limit}). (${startAt})`
  );

  const mutationResult = await normalizeInBulk({
    survey,
    edition,
    responses,
    limit,
    isRenormalization: false,
  });
  return mutationResult;
};
