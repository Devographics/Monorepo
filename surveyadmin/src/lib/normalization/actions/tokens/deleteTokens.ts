import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { DeleteTokensParams, RenameTokensParams } from "../../services";
import { cleanTokensUpIfNeeded } from ".";

export type DeleteTokensData = {
  modifiedCount: number;
  success: string;
};

/*

Delete a custom or ai token everywhere it appears for the current edition

*/
export const deleteTokens = async (params: DeleteTokensParams) => {
  const { editionId, tokens } = params;
  let modifiedCount = 0;
  const customNormCollection = await getCustomNormalizationsCollection();
  for (const tokenToRemove of tokens) {
    console.log(`// Deleting token ${tokenToRemove} for edition ${editionId}…`);

    const updateResult = await customNormCollection.updateMany(
      { editionId },
      {
        $pull: {
          customTokens: tokenToRemove,
          aiTokens: tokenToRemove,
          importedTokens: tokenToRemove,
          suggestedTokens: tokenToRemove,
        },
      },
      { returnDocument: "after" }
    );
    modifiedCount += updateResult.modifiedCount;
  }
  const success = `→ Deleted ${modifiedCount} tokens (${tokens.join(", ")})`;

  console.log(success);

  return { modifiedCount, success } as DeleteTokensData;
};
