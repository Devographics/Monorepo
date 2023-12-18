import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { getNormalizationId } from "./addCustomTokens";
import { CustomNormalizationParams } from "@devographics/types";

export const cleanUpIfNeeded = async (document) => {
  const customNormCollection = await getCustomNormalizationsCollection();
  // if document has no tokens after update, we can delete the entire
  // customNormalization document
  if (
    (!document?.customTokens || document?.customTokens?.length === 0) &&
    (!document?.disabledTokens || document?.disabledTokens?.length === 0)
  ) {
    return await customNormCollection.deleteOne({ _id: document._id });
  }
};
/*

Remove one or more tokens from a custom normalization entry

*/
export const removeCustomTokens = async (params: CustomNormalizationParams) => {
  const { tokens } = params;
  const normalizationId = getNormalizationId(params);
  const customNormCollection = await getCustomNormalizationsCollection();
  const updateResult = await customNormCollection.findOneAndUpdate(
    { normalizationId },
    {
      $pull: {
        // does not work for some reason
        // customTokens: {$in: tokens},
        customTokens: tokens[0],
      },
    },
    { returnNewDocument: true, returnDocument: "after" }
  );
  const document = updateResult.value;
  const deleteResult = await cleanUpIfNeeded(document);
  return { action: "removeCustomTokens", updateResult, deleteResult, document };
};
