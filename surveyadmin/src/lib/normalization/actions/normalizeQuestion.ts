import { getEditionQuestionById } from "../normalize/helpers";
import { getSelector } from "../helpers/getSelectors";
import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveyMetadata } from "@devographics/fetch";
import { normalizeInBulk, defaultLimit } from "../normalize/normalizeInBulk";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getQuestionResponses } from "./getQuestionResponses";

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

  const survey = await fetchSurveyMetadata({ surveyId });
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
    shouldGetFromCache: false,
  });
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
    edition,
    responses,
    limit,
    questionId,
    isRenormalization: true,
  });

  console.log(`⛰️ Refreshing responses cache for question ${questionId}…`);

  const questionResponseData = await getQuestionResponses({
    surveyId,
    editionId,
    questionId,
    shouldGetFromCache: false,
  });

  return { ...mutationResult, questionResponseData };
};
