import { getCustomNormalizationsCollection } from "@devographics/mongo";

export type RemoveCustomTokensProps = { tokens: string[]; responseId: string };

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
export const removeCustomTokens = async ({
  tokens,
  responseId,
}: RemoveCustomTokensProps) => {
  const customNormCollection = await getCustomNormalizationsCollection();
  const updateResult = await customNormCollection.findOneAndUpdate(
    { responseId },
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
