import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveysMetadata } from "~/lib/api/fetch";
import { normalizeInBulk } from "./normalizeInBulk";
import { logToFile } from "@devographics/helpers";

export type NormalizeResponsesArgs = {
  // note: we need a surveyId to figure out which database to use
  surveyId: string;
  responsesIds: string[];
};

/*

Normalize a specific set of responses (probably never used?)

*/
export const normalizeResponses = async (args: NormalizeResponsesArgs) => {
  const { surveyId, responsesIds } = args;

  const surveys = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    throw new Error(`Could not find survey for surveyId ${surveyId}`);
  }
  const rawResponsesCollection = await getRawResponsesCollection(survey);

  // first, get all the responses we're going to operate on
  const responses = await rawResponsesCollection
    .find({ _id: { $in: responsesIds } })
    .toArray();

  const startAt = new Date();

  console.log(
    `⛰️ Renormalizing responses [${responsesIds.join(", ")}]… (${startAt})`
  );

  const mutationResult = await normalizeInBulk({ survey, responses, args });

  return mutationResult;
};
