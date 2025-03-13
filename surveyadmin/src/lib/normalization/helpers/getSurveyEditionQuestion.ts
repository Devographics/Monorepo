import { fetchSurveysMetadata } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import { getQuestionObject } from "./getQuestionObject";
import { getEditionQuestionById } from "./getEditionQuestionById";

export const getSurveyEditionSectionQuestion = async ({
  surveyId,
  editionId,
  questionId,
  shouldGetFromCache,
}: {
  surveyId: string;
  editionId: string;
  questionId: string;
  shouldGetFromCache?: boolean;
}) => {
  const { data: surveys, duration: fetchSurveysMetadataDuration } =
    await fetchSurveysMetadata({ shouldGetFromCache, addCredits: false });
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) {
    throw new Error(`Could not find survey for surveyId ${surveyId}`);
  }

  const { data: edition, duration: fetchEditionMetadataAdminDuration } =
    await fetchEditionMetadataAdmin({
      surveyId,
      editionId,
      shouldGetFromCache,
    });
  if (!edition) {
    throw new Error(`Could not find edition for editionId ${editionId}`);
  }

  let question = getEditionQuestionById({ edition, questionId });

  const section = question.section;

  const questionObject = getQuestionObject({
    survey,
    edition,
    section,
    question,
  });
  return {
    survey,
    edition,
    section,
    question: questionObject,
    durations: {
      fetchSurveysMetadataDuration,
      fetchEditionMetadataAdminDuration,
    },
  };
};
