import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { CustomNormalizationDocument } from "@devographics/types";

export type EnableRegularTokensProps = { tokens: string[]; responseId: string };

/*

Re-enable one or more regex tokens by removing them from disabled tokens list

*/
export const enableRegularTokens = async ({
  tokens,
  responseId,
}: EnableRegularTokensProps) => {
  const customNormCollection = await getCustomNormalizationsCollection();
  const updateResult = await customNormCollection.findOneAndUpdate(
    { responseId },
    {
      $pull: {
        disabledTokens: { $in: tokens },
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
