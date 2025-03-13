import { fetchQuestionData, getQuestionDataQuery } from "@devographics/fetch";
import { ResultsSubFieldEnum } from "@devographics/types";

export interface GetQuestionDataArgs {
  surveyId: string;
  editionId: string;
  sectionId: string;
  questionId: string;
  shouldGetFromCache: boolean;
}

export const getQuestionData = async ({
  surveyId,
  editionId,
  sectionId,
  questionId,
  shouldGetFromCache,
}: GetQuestionDataArgs) => {
  const queryOptions = {
    surveyId,
    editionId,
    sectionId,
    questionId,
    subField: ResultsSubFieldEnum.FREEFORM,
  };
  const queryArgs = { parameters: { enableCache: shouldGetFromCache } };
  const data = await fetchQuestionData({
    shouldGetFromCache,
    getQuery: getQuestionDataQuery,
    ...queryOptions,
    queryArgs,
  });
  const query = getQuestionDataQuery({ queryOptions, queryArgs });
  return { data, query };
};
