import { getEditionQuestionById, getSelector } from "../helpers";
import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchEditionMetadata, fetchSurveysMetadata } from "~/lib/api/fetch";
import { normalizeInBulk, defaultLimit } from "./normalizeInBulk";

export type NormalizeQuestionArgs = {
  surveyId: string;
  editionId: string;
  questionId: string;
  startFrom?: number;
  limit?: number;
  onlyUnnormalized?: boolean;
};

/*

Normalize all response documents for a specific question
(only used when we want to force renormalization for all responses, including
  ones that have already been normalized)

*/
export const normalizeQuestion = async (args: NormalizeQuestionArgs) => {
  const {
    surveyId,
    editionId,
    questionId,
    startFrom = 0,
    limit = defaultLimit,
    onlyUnnormalized,
  } = args;
  const startAt = new Date();

  const surveys = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    throw new Error(`Could not find survey for surveyId ${surveyId}`);
  }

  const edition = await fetchEditionMetadata({ surveyId, editionId });
  if (!edition) {
    throw new Error(`Could not find edition for editionId ${editionId}`);
  }

  const question = getEditionQuestionById({ edition, questionId });

  const rawResponsesCollection = await getRawResponsesCollection(survey);

  const selector = await getSelector({ survey, edition, question });

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
    `⛰️ Renormalizing question ${editionId}/${questionId}… Found ${responses.length} responses to renormalize (startFrom: ${startFrom}, limit: ${limit}). (${startAt})`
  );

  const mutationResult = await normalizeInBulk({
    survey,
    responses,
    limit,
    questionId,
    isRenormalization: true,
  });

  return mutationResult;
};
