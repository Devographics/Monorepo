import {
  fetchSurveysMetadata,
  fetchQuestionData,
  fetchEntities,
} from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestionById, getAllResponses } from "../normalize/helpers";
import get from "lodash/get";
import { ResultsSubFieldEnum } from "@devographics/types";
import pick from "lodash/pick";

export const getQuestionResponses = async ({
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
  const {
    responses,
    rawFieldPath,
    normalizedFieldPath,
    patternsFieldPath,
    selector,
  } = await getAllResponses({
    survey,
    edition,
    question,
  });

  const allResponses = responses.map((r) => {
    return {
      _id: r._id,
      responseId: r.responseId,
      value: get(r, rawFieldPath),
      normalizedValue: get(r, normalizedFieldPath),
      patterns: get(r, patternsFieldPath),
    };
  });

  const responsesCount = allResponses.length;

  const questionResult = await fetchQuestionData({
    shouldGetFromCache: false,
    surveyId,
    editionId,
    sectionId: question.section.id,
    questionId,
    subField: ResultsSubFieldEnum.FREEFORM,
    queryArgs: { parameters: { enableCache: false } },
  });

  const allEntities = await fetchEntities();
  const entities = allEntities.data.map((e) =>
    pick(e, ["id", "patterns", "tags"])
  );

  return {
    responsesCount,
    responses: allResponses,
    responsesSelector: selector,
    questionResult,
    entities,
  };
};