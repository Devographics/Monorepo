import { getSelector } from "../helpers";
import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveysMetadata } from "~/lib/api/fetch";
import { normalizeInBulk } from "./normalizeInBulk";

const defaultLimit = 999;

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
  console.log("// normalizeResponses");
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
    `// Renormalizing all questions for edition ${editionId}… Found ${responses.length} responses to renormalize (startFrom: ${startFrom}, limit: ${limit}). (${startAt})`
  );

  const mutationResult = await normalizeInBulk({
    survey,
    responses,
    args,
    limit,
  });
  return mutationResult;
};
