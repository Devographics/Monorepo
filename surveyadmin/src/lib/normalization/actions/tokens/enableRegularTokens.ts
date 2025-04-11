import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { cleanTokensUpIfNeeded } from "./removeCustomTokens";
import { getNormalizationId } from "./addCustomTokens";
import { CustomNormalizationParams } from "@devographics/types";

/*

Re-enable one or more regex tokens by removing them from disabled tokens list

*/
export const enableRegularTokens = async (
  params: CustomNormalizationParams
) => {
  const { tokens } = params;
  const normalizationId = getNormalizationId(params);
  const customNormCollection = await getCustomNormalizationsCollection();
  const updateResult = await customNormCollection.findOneAndUpdate(
    { normalizationId },
    {
      $pull: {
        disabledTokens: tokens[0],
      },
    },
    { returnDocument: "after" }
  );
  const document = updateResult.value;
  const deleteResult = await cleanTokensUpIfNeeded(document);
  return {
    action: "enableRegularTokens",
    updateResult,
    deleteResult,
    document,
  };
};
