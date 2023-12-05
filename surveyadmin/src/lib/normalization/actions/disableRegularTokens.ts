import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { CustomNormalizationDocument } from "@devographics/types";

export type DisableRegularTokensProps = Omit<
  CustomNormalizationDocument,
  "addedTokens" | "removedTokens"
> & { tokens: string[] };

/*

Specify one or more regex tokens to be disabled

*/
export const disableRegularTokens = async (
  document: DisableRegularTokensProps
) => {
  const { responseId, tokens, ...rest } = document;
  const customNormCollection = await getCustomNormalizationsCollection();
  const result = customNormCollection.updateOne(
    { responseId },
    {
      $set: { _id: responseId, responseId, ...rest },
      $addToSet: {
        disabledTokens: { $each: tokens },
      },
    },
    { upsert: true }
  );
  return result;
};
