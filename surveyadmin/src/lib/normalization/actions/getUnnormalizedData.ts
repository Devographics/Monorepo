import { fetchSurveysMetadata, fetchQuestionData } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import {
  getEditionQuestionById,
  getQuestionResponsesCount,
  getUnnormalizedResponses,
} from "../normalize/helpers";
import { getEditionQuestions } from "../helpers/getEditionQuestions";
import get from "lodash/get";
import { ResultsSubFieldEnum } from "@devographics/types";

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
  const { data: edition } = await fetchEditionMetadataAdmin({
    surveyId,
    editionId,
    shouldGetFromCache: false,
  });
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

  const questionResult = await fetchQuestionData({
    surveyId,
    editionId,
    sectionId: question.section.id,
    questionId,
    subField: ResultsSubFieldEnum.FREEFORM,
  });

  return { responsesCount, unnormalizedResponses, questionResult };
};
