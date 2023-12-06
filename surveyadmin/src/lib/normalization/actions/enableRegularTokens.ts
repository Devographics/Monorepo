import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { CustomNormalizationDocument } from "@devographics/types";
import { cleanUpIfNeeded } from "./removeCustomTokens";

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
        disabledTokens: tokens[0],
      },
    },
    { returnNewDocument: true, returnDocument: "after" }
  );
  const document = updateResult.value;
  const deleteResult = await cleanUpIfNeeded(document);
  return {
    action: "enableRegularTokens",
    updateResult,
    deleteResult,
    document,
  };
};
