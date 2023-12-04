import {
  fetchSurveysMetadata,
  fetchQuestionData,
  fetchEntities,
} from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getEditionQuestionById } from "../helpers/getEditionQuestionById";
import { getAllResponses } from "../helpers/getAllResponses";
import get from "lodash/get";
import { ResultsSubFieldEnum } from "@devographics/types";
import pick from "lodash/pick";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";

export const getQuestionResponses = async ({
  surveyId,
  editionId,
  questionId,
  shouldGetFromCache = true,
}) => {
  const { survey, edition, section, question, durations } =
    await getSurveyEditionSectionQuestion({ surveyId, editionId, questionId });

  // console.log(`// unnormalizedFields ${editionId} ${questionId}`);
  const { data, duration: getAllResponsesDuration } = await getAllResponses({
    survey,
    edition,
    section,
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
      ...durations,
      fetchQuestionDataDuration,
      getAllResponsesDuration,
      fetchEntitiesDuration,
    },
  };
};
