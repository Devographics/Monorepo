import { fetchQuestionData } from "@devographics/fetch";
import { getQuestionResponsesCount } from "../normalize/helpers";
import { getUnnormalizedResponses } from "../helpers/getUnnormalizedResponses";
import get from "lodash/get";
import { ResultsSubFieldEnum } from "@devographics/types";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";

export const getUnnormalizedData = async ({
  surveyId,
  editionId,
  questionId,
}) => {
  const { survey, edition, section, question, durations } =
    await getSurveyEditionSectionQuestion({ surveyId, editionId, questionId });

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
    shouldGetFromCache: false,
    surveyId,
    editionId,
    sectionId: question.section.id,
    questionId,
    subField: ResultsSubFieldEnum.FREEFORM,
  });

  return { responsesCount, unnormalizedResponses, questionResult };
};
