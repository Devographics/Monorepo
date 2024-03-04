import {
  fetchQuestionData,
  fetchEntities,
  getQuestionDataQuery,
} from "@devographics/fetch";
import { getAllResponses } from "../helpers/getAllResponses";
import { ResultsSubFieldEnum } from "@devographics/types";
import pick from "lodash/pick";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";

export interface GetQuestionResponsesParams {
  surveyId: string;
  editionId: string;
  questionId: string;
  shouldGetFromCache?: boolean;
}

export const getQuestionResponses = async ({
  surveyId,
  editionId,
  questionId,
  shouldGetFromCache = true,
}: GetQuestionResponsesParams) => {
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

  const { normalizationResponses, selector } = data;

  const allResponses = normalizationResponses;

  const responsesCount = allResponses?.length;

  const queryOptions = {
    surveyId,
    editionId,
    sectionId: question.section.id,
    questionId,
    subField: ResultsSubFieldEnum.FREEFORM,
  };
  const queryArgs = { parameters: { enableCache: shouldGetFromCache } };
  const questionDataPayload = await fetchQuestionData({
    shouldGetFromCache,
    ...queryOptions,
    queryArgs,
  });

  const questionDataQuery = getQuestionDataQuery({ queryOptions, queryArgs });

  const fetchQuestionDataDuration = questionDataPayload.duration;

  const { data: allEntities, duration: fetchEntitiesDuration } =
    await fetchEntities({ shouldGetFromCache });

  // limit entities to the ones that are included in the question's matchTags
  const entities = allEntities
    .filter((e) =>
      e.tags?.some((tag) =>
        [question.id, ...(question?.matchTags || [])]?.includes(tag)
      )
    )
    .map((e) =>
      pick(e, ["id", "parentId", "patterns", "tags", "descriptionClean"])
    );

  return {
    responsesCount,
    responses: allResponses,
    responsesSelector: selector,
    questionDataPayload,
    questionDataQuery,
    entities,
    durations: {
      ...durations,
      fetchQuestionDataDuration,
      getAllResponsesDuration,
      fetchEntitiesDuration,
    },
  };
};
