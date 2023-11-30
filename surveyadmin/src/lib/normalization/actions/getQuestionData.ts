import { fetchQuestionData } from "@devographics/fetch";
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
  shouldGetFromCache = true,
}: GetQuestionDataArgs) => {
  const data = await fetchQuestionData({
    shouldGetFromCache,
    surveyId,
    editionId,
    sectionId,
    questionId,
    subField: ResultsSubFieldEnum.FREEFORM,
    queryArgs: { parameters: { enableCache: shouldGetFromCache } },
  });
  return data;
};
