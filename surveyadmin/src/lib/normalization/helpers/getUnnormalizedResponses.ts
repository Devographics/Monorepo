import get from "lodash/get.js";
import sortBy from "lodash/sortBy.js";
import {
  EditionMetadata,
  SurveyMetadata,
  QuestionWithSection,
} from "@devographics/types";
import { getNormResponsesCollection } from "@devographics/mongo";
import { getQuestionObject } from "./getQuestionObject";
import { getUnnormalizedResponsesSelector } from "./getSelectors";
import { NormalizedResponseDocument } from "../types";

export const getUnnormalizedResponses = async ({
  survey,
  edition,
  question,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
}) => {
  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;
  const rawFieldPath = questionObject?.normPaths?.raw!;
  const normalizedFieldPath = questionObject?.normPaths?.other!;

  const selector = getUnnormalizedResponsesSelector({
    edition,
    questionObject,
  });

  const NormResponses =
    await getNormResponsesCollection<NormalizedResponseDocument>();
  let responses = await NormResponses.find(selector, {
    projection: {
      _id: 1,
      responseId: 1,
      [rawFieldPath]: 1,
    },
    sort: { [rawFieldPath]: 1 },
    //lean: true
  }).toArray();

  // use case-insensitive sort
  responses = sortBy(responses, [
    (response) => String(get(response, rawFieldPath)).toLowerCase(),
  ]);

  return { responses, rawFieldPath, normalizedFieldPath };
};
