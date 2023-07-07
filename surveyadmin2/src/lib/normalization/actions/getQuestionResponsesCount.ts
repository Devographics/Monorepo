import { getRawResponsesCollection } from "@devographics/mongo";
import { fetchSurveysMetadata } from "../../api/fetch";
import { getSelector } from "../helpers";

type GetSurveyMetadataArgs = {
  surveyId: string;
  editionId: string;
  questionId?: string;
  onlyUnnormalized?: boolean;
};

export const getQuestionResponsesCount = async (
  args: GetSurveyMetadataArgs
) => {
  const { surveyId, editionId, questionId, onlyUnnormalized } = args;

  const surveys = await fetchSurveysMetadata();
  const survey = surveys.find((s) => s.id === surveyId);

  const selector = await getSelector({
    surveyId,
    editionId,
    questionId,
    onlyUnnormalized,
  });

  const rawResponsesCollection = await getRawResponsesCollection(survey);
  const responsesCount = await rawResponsesCollection.countDocuments(selector);
  console.log("// getQuestionResponsesCount");
  console.log(responsesCount);
  return responsesCount;
};
