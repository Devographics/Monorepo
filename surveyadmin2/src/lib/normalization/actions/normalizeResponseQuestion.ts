import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveysMetadata } from "~/lib/api/fetch";
import { normalizeInBulk } from "./normalizeInBulk";

export type NormalizeResponseQuestionArgs = {
  // note: we need a surveyId to figure out which database to use
  surveyId: string;
  questionId: string;
  responsesIds: string[];
};

/*

Normalize a specific question on a specific response

*/
export const normalizeResponseQuestion = async (
  args: NormalizeResponseQuestionArgs
) => {
  const { surveyId, questionId, responsesIds } = args;
  console.log("// normalizeResponseQuestion");
  console.log(args);

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
    `// Renormalizing responses [${responsesIds.join(", ")}]… (${startAt})`
  );

  const mutationResult = await normalizeInBulk({
    survey,
    responses,
    questionId,
    args,
  });

  return mutationResult;
};
