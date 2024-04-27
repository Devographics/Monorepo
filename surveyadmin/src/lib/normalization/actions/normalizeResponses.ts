import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveyMetadata } from "@devographics/fetch";
import { normalizeInBulk } from "../normalize/normalizeInBulk";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import trim from "lodash/trim.js";

export type NormalizeResponsesArgs = {
  // note: we need a surveyId to figure out which database to use
  surveyId: string;
  editionId: string;
  responsesIds: string[];
  isVerbose?: boolean;
};

/*

Normalize all questions for a specific set of responses

*/
export const normalizeResponses = async (args: NormalizeResponsesArgs) => {
  const { surveyId, editionId, responsesIds, isVerbose = true } = args;

  const cleanResponsesIds = responsesIds.map((r) => trim(r));

  const survey = await fetchSurveyMetadata({ surveyId });
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
    shouldGetFromCache: false,
  });
  const rawResponsesCollection = await getRawResponsesCollection(survey);

  // first, get all the responses we're going to operate on
  const responses = await rawResponsesCollection
    .find({ _id: { $in: cleanResponsesIds } })
    .toArray();

  const startAt = new Date();

  console.log(
    `⛰️ Renormalizing responses [${responses
      .map((r) => r._id)
      .join(", ")}]… (${startAt})`
  );

  const mutationResult = await normalizeInBulk({
    survey,
    edition,
    responses,
    verbose: isVerbose,
  });

  return mutationResult;
};
