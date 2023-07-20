import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveyMetadata } from "@devographics/fetch";
import { normalizeInBulk } from "../normalize/normalizeInBulk";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";

export type NormalizeResponsesArgs = {
  // note: we need a surveyId to figure out which database to use
  surveyId: string;
  editionId: string;
  responsesIds: string[];
};

/*

Normalize all questions for a specific set of responses (probably never used?)

*/
export const normalizeResponses = async (args: NormalizeResponsesArgs) => {
  const { surveyId, editionId, responsesIds } = args;

  const survey = await fetchSurveyMetadata({ surveyId });
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
  });
  const rawResponsesCollection = await getRawResponsesCollection(survey);

  // first, get all the responses we're going to operate on
  const responses = await rawResponsesCollection
    .find({ _id: { $in: responsesIds } })
    .toArray();

  const startAt = new Date();

  console.log(
    `⛰️ Renormalizing responses [${responsesIds.join(", ")}]… (${startAt})`
  );

  const mutationResult = await normalizeInBulk({ survey, edition, responses });

  return mutationResult;
};
