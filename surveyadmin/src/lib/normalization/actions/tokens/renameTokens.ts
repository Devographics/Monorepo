import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { RenameTokensParams } from "../../services";

export type RenameTokensData = {
  modifiedCount: number;
  success: string;
};

export const renameTokens = async (params: RenameTokensParams) => {
  const { tokens } = params;
  console.log(tokens);
  const modifiedIds: string[] = [];
  let modifiedCount = 0;
  const customNormCollection = await getCustomNormalizationsCollection();
  const modifier: any = { $set: {} };
  for (const token of tokens) {
    const { from: fromToken, to: toToken } = token;
    console.log(`// Renaming token ${fromToken} to ${toToken}…`);

    const itemsToRename = await customNormCollection
      .find({ $or: [{ customTokens: fromToken }, { aiTokens: fromToken }] })
      .toArray();
    for (const item of itemsToRename) {
      const { _id, customTokens = [], aiTokens = [] } = item;

      const customTokenIndex = customTokens.findIndex((t) => t === fromToken);
      if (customTokenIndex > -1) {
        customTokens[customTokenIndex] = toToken;
        modifier.$set.customTokens = customTokens;
        modifiedCount++;
      }

      const aiTokenIndex = aiTokens.findIndex((t) => t === fromToken);
      if (aiTokenIndex > -1) {
        aiTokens[aiTokenIndex] = toToken;
        modifier.$set.aiTokens = aiTokens;
        modifiedCount++;
      }

      if (customTokenIndex > -1 || aiTokenIndex > -1) {
        modifiedIds.push(_id);
        customNormCollection.updateOne({ _id }, modifier);
      }
    }
  }
  const success = `→ Renamed ${modifiedCount} tokens (${tokens
    .map((t) => t.to)
    .join(", ")}) for ids ${modifiedIds.join(", ")}`;

  console.log(success);

  return { modifiedCount, success } as RenameTokensData;
};
