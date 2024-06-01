import { convertExperience as convertExperience_ } from "~/lib/normalization/helpers/convertExperience";

export const convertExperience = async (args) => {
  const { surveyId, editionId } = args;
  return await convertExperience_({ surveyId, editionId });
};

convertExperience.args = ["surveyId", "editionId"];

convertExperience.description = `Convert experience from 5-option format to 3-option + sentiment format`;
