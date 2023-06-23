import { getSelector } from "../helpers";
import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveysMetadata } from "~/lib/api/fetch";
import { normalizeInBulk } from "./normalizeInBulk";

const defaultLimit = 999;

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
  console.log("// normalizeQuestion");
  console.log(args);
  const startAt = new Date();

  const surveys = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    throw new Error(`Could not find survey for surveyId ${surveyId}`);
  }
  const rawResponsesCollection = await getRawResponsesCollection(survey);

  const selector = await getSelector({
    surveyId,
    editionId,
    questionId,
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
    `// Renormalizing question ${editionId}/${questionId}… Found ${responses.length} responses to renormalize (startFrom: ${startFrom}, limit: ${limit}). (${startAt})`
  );

  const mutationResult = await normalizeInBulk({
    survey,
    responses,
    args,
    limit,
    questionId,
  });

  return mutationResult;
};
