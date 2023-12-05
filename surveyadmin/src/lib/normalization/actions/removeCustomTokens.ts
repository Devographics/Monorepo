import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { CustomNormalizationDocument } from "@devographics/types";

export type RemoveCustomTokensProps = { tokens: string[]; responseId: string };

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
        tokens: { $in: tokens },
      },
    },
    { returnNewDocument: true }
  );
  // const updatedDocument = updateResult.value
  console.log(updateResult);
  // if (updatedDocument.tokens)
  // // delete all normalization definitions with no tokens, just in case
  // // we just removed the last token
  // const deleteResult = customNormCollection.deleteMany({ tokens: { $eq: [] } });
  // return { updateResult, deleteResult };
};
