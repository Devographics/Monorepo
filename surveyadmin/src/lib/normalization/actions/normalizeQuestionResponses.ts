import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveyMetadata } from "@devographics/fetch";
import { normalizeInBulk } from "../normalize/normalizeInBulk";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";
import { getQuestionResponses } from "./getQuestionResponses";
import { NormalizeInBulkResult } from "../types";

export type NormalizeQuestionResponsesArgs = {
  // note: we need a surveyId to figure out which database to use
  surveyId: string;
  editionId: string;
  questionId: string;
  responsesIds: string[];
  isVerbose?: boolean;
};

/*

Normalize a specific question on a specific response

*/
export const normalizeQuestionResponses = async (
  args: NormalizeQuestionResponsesArgs
) => {
  const {
    surveyId,
    editionId,
    questionId,
    responsesIds,
    isVerbose = false,
  } = args;

  const { survey, edition, section, question, durations } =
    await getSurveyEditionSectionQuestion({ surveyId, editionId, questionId });

  const rawResponsesCollection = await getRawResponsesCollection(survey);

  // first, get all the responses we're going to operate on
  const responses = await rawResponsesCollection
    .find({ _id: { $in: responsesIds } })
    .toArray();

  const startAt = new Date();

  console.log(
    `⛰️ Renormalizing question ${questionId} for responses [${responsesIds.join(
      ", "
    )}]… (${startAt})`
  );

  const mutationResult = await normalizeInBulk({
    survey,
    edition,
    responses,
    questionId,
    isRenormalization: true,
    verbose: isVerbose,
  });

  console.log(`⛰️ Refreshing responses cache for question ${questionId}…`);

  // note: even if we don't return question responses we do need to refresh the cache
  // (but we don't need to await the result)
  const questionResponseData = /* await */ getQuestionResponses({
    surveyId,
    editionId,
    questionId,
    shouldGetFromCache: false,
  });

  const result: NormalizeInBulkResult = {
    ...mutationResult /*, questionResponseData*/,
  };
  return result;
};
