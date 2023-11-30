import {
  fetchSurveysMetadata,
  fetchQuestionData,
  fetchEntities,
} from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestionById } from "../normalize/helpers";
import { getAllResponses } from "../helpers/getAllResponses";
import get from "lodash/get";
import { ResultsSubFieldEnum } from "@devographics/types";
import pick from "lodash/pick";

export const getQuestionResponses = async ({
  surveyId,
  editionId,
  questionId,
  shouldGetFromCache = true,
}) => {
  const { data: surveys, duration: fetchSurveysMetadataDuration } =
    await fetchSurveysMetadata({ shouldGetFromCache });
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    throw new Error(`Could not find survey with id ${surveyId}`);
  }
  const { data: edition, duration: fetchEditionMetadataAdminDuration } =
    await fetchEditionMetadataAdmin({
      surveyId,
      editionId,
      shouldGetFromCache,
    });
  if (!edition) {
    throw new Error(`Could not find edition with id ${editionId}`);
  }
  const question = getEditionQuestionById({ edition, questionId });
  if (!question) {
    throw new Error(`Could not find question with id ${questionId}`);
  }

  // console.log(`// unnormalizedFields ${editionId} ${questionId}`);
  const { data, duration: getAllResponsesDuration } = await getAllResponses({
    survey,
    edition,
    question,
    shouldGetFromCache,
  });

  const {
    normalizationResponses,
    rawFieldPath,
    normalizedFieldPath,
    patternsFieldPath,
    selector,
  } = data;

  const allResponses = normalizationResponses;

  const responsesCount = allResponses?.length;

  const questionResult = await fetchQuestionData({
    shouldGetFromCache,
    surveyId,
    editionId,
    sectionId: question.section.id,
    questionId,
    subField: ResultsSubFieldEnum.FREEFORM,
    queryArgs: { parameters: { enableCache: shouldGetFromCache } },
  });
  const fetchQuestionDataDuration = questionResult.duration;

  const { data: allEntities, duration: fetchEntitiesDuration } =
    await fetchEntities({ shouldGetFromCache });

  // limit entities to the ones that are included in the question's matchTags
  const entities = allEntities
    .filter((e) =>
      e.tags?.some((tag) =>
        [question.id, ...(question?.matchTags || [])]?.includes(tag)
      )
    )
    .map((e) => pick(e, ["id", "patterns", "tags", "descriptionClean"]));

  return {
    responsesCount,
    responses: allResponses,
    responsesSelector: selector,
    questionResult,
    entities,
    durations: {
      fetchSurveysMetadataDuration,
      fetchEditionMetadataAdminDuration,
      fetchQuestionDataDuration,
      getAllResponsesDuration,
      fetchEntitiesDuration,
    },
  };
};
