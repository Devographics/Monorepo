import { loadOrGetSurveys } from "~/modules/surveys/load";

export const surveysTypeDefs = "surveys: JSON";

export const surveys = async () => {
  return loadOrGetSurveys();
};
