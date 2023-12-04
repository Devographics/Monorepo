import { fetchSurveysMetadata, fetchQuestionData } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getQuestionResponsesCount } from "../normalize/helpers";
import { getEditionQuestionById } from "../helpers/getEditionQuestionById";
import { getUnnormalizedResponses } from "../helpers/getUnnormalizedResponses";
import { getEditionQuestions } from "../helpers/getEditionQuestions";
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
