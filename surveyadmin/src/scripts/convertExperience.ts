import { convertExperience as convertExperience_ } from "~/lib/normalization/helpers/convertExperience";

export const convertExperience = async (args) => {
  const { surveyId, editionId } = args;
  return await convertExperience_({ surveyId, editionId });
};

convertExperience.args = ["surveyId", "editionId"];

convertExperience.description = `Add dedicated sentiment field to all questions that support sentiment`;
