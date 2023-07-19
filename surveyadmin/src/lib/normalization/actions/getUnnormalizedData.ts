import {
  fetchEditionMetadata,
  fetchSurveysMetadata,
} from "@devographics/fetch";
import {
  getEditionQuestionById,
  getQuestionResponsesCount,
  getUnnormalizedResponses,
} from "../normalize/helpers";
import { getEditionQuestions } from "../helpers/getEditionQuestions";
import get from "lodash/get";

export const getUnnormalizedData = async ({
  surveyId,
  editionId,
  questionId,
}) => {
  const { data: surveys } = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    throw new Error(`Could not find survey with id ${surveyId}`);
  }
  const { data: edition } = await fetchEditionMetadata({ surveyId, editionId });
  if (!edition) {
    throw new Error(`Could not find edition with id ${editionId}`);
  }
  const question = getEditionQuestionById({ edition, questionId });
  if (!question) {
    throw new Error(`Could not find question with id ${questionId}`);
  }

  // console.log(`// unnormalizedFields ${editionId} ${questionId}`);
  const { responses, rawFieldPath } = await getUnnormalizedResponses({
    survey,
    edition,
    question,
  });

  const unnormalizedResponses = responses.map((r) => {
    return {
      _id: r._id,
      responseId: r.responseId,
      value: get(r, rawFieldPath),
    };
  });

  const responsesCount = await getQuestionResponsesCount({
    survey,
    edition,
    question,
  });
  return { responsesCount, unnormalizedResponses };
};
