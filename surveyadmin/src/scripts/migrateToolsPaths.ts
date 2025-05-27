import { migrateToolsPaths as migrateToolsPaths_ } from "~/lib/normalization/helpers/migrateToolsPaths";

export const migrateToolsPaths = async (args) => {
  const { surveyId, editionId } = args;
  return await migrateToolsPaths_({ surveyId, editionId });
};

migrateToolsPaths.args = ["surveyId", "editionId"];

migrateToolsPaths.description = `Migrate raw responses paths from "tools_others" and "other_tools" to just "tools"`;

migrateToolsPaths.deprecated = true;
