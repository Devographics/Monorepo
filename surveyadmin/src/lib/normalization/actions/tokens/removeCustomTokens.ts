import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { getNormalizationId } from "./addCustomTokens";
import { CustomNormalizationParams } from "@devographics/types";

export const cleanTokensUpIfNeeded = async (document) => {
  const customNormCollection = await getCustomNormalizationsCollection();
  // if document has no tokens after update, we can delete the entire
  // customNormalization document
  if (
    (!document?.aiTokens || document?.aiTokens?.length === 0) &&
    (!document?.importedTokens || document?.importedTokens?.length === 0) &&
    (!document?.suggestedTokens || document?.suggestedTokens?.length === 0) &&
    (!document?.customTokens || document?.customTokens?.length === 0) &&
    (!document?.disabledTokens || document?.disabledTokens?.length === 0)
  ) {
    return await customNormCollection.deleteOne({ _id: document._id });
  }
};
/*

Remove a token from a specific custom normalization entry

*/
export const removeCustomTokens = async (params: CustomNormalizationParams) => {
  const { tokens } = params;
  const tokenToRemove = tokens[0];
  const normalizationId = getNormalizationId(params);
  const customNormCollection = await getCustomNormalizationsCollection();
  const updateResult = await customNormCollection.findOneAndUpdate(
    { normalizationId },
    {
      $pull: {
        // does not work for some reason
        // customTokens: {$in: tokens},
        customTokens: tokenToRemove,
        aiTokens: tokenToRemove,
        suggestedTokens: tokenToRemove,
      },
    },
    { returnDocument: "after" }
  );
  const document = updateResult.value;
  const deleteResult = await cleanTokensUpIfNeeded(document);
  return { action: "removeCustomTokens", updateResult, deleteResult, document };
};
