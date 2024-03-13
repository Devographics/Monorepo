import { addSentiment as addSentiment_ } from "~/lib/normalization/helpers/addSentiment";

export const addSentiment = async (args) => {
  const { surveyId, editionId } = args;
  return await addSentiment_({ surveyId, editionId });
};

addSentiment.args = ["surveyId", "editionId"];

addSentiment.description = `Add dedicated sentiment field to all questions that support sentiment`;
