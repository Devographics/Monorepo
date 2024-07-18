import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { ApproveTokensParams, RenameTokensParams } from "../../services";
import { ObjectId } from "mongodb";
export const approveTokens = async (params: ApproveTokensParams) => {
  const { tokens } = params;

  let modifiedCount = 0;
  const customNormCollection = await getCustomNormalizationsCollection();

  console.log(params);

  for (const token of tokens) {
    const { id, renameTo, normalizationId, shouldDismiss = false } = token;

    const selector = { normalizationId };
    // remove token from the suggested token list
    const operation = {
      $pull: { suggestedTokens: id },
    };

    if (!shouldDismiss) {
      // unless we should dismiss the token, add it as a regular customToken
      operation["$addToSet"] = { customTokens: renameTo };
    }

    const result = await customNormCollection.updateOne(selector, operation);
    console.log(selector);
    console.log(operation);
    console.log(result);
    modifiedCount++;
  }
  return { action: "approveTokens", modifiedCount };
};
