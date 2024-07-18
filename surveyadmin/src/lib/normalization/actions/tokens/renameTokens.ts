import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { RenameTokensParams } from "../../services";

export const renameTokens = async (params: RenameTokensParams) => {
  const { tokens } = params;
  console.log(tokens);
  let modifiedCount = 0;
  const customNormCollection = await getCustomNormalizationsCollection();
  for (const token of tokens) {
    const { from, to } = token;
    console.log(`// Renaming token ${from} to ${to}…`);

    const itemsToRename = await customNormCollection
      .find({ customTokens: from })
      .toArray();
    for (const item of itemsToRename) {
      const { _id, customTokens } = item;
      const tokenIndex = customTokens.findIndex((t) => t === from);
      customTokens[tokenIndex] = to;
      customNormCollection.updateOne({ _id }, { $set: { customTokens } });
      modifiedCount++;
    }
  }
  return { action: "renameTokens", modifiedCount };
};
