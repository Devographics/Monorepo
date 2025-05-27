import { generateSourceField2 } from "~/lib/normalization/helpers/generateSourceField";

export const generateSourceField = async (args) => {
  const { surveyId, editionId } = args;
  return await generateSourceField2({ surveyId, editionId });
};

generateSourceField.args = ["surveyId", "editionId"];

generateSourceField.description = `Generate source field for an edition`;

generateSourceField.deprecated = true;
