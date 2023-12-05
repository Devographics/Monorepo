import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { CustomNormalizationDocument } from "@devographics/types";

export type AddCustomTokensProps = Omit<
  CustomNormalizationDocument,
  "addedTokens" | "removedTokens"
> & { tokens: string[] };

/*

Add one or more tokens to a custom normalization entry, or create it if 
it doesn't exist yet

*/
export const addCustomTokens = async (document: AddCustomTokensProps) => {
  const { responseId, tokens, ...rest } = document;
  const customNormCollection = await getCustomNormalizationsCollection();
  const updateResult = await customNormCollection.findOneAndUpdate(
    { responseId },
    {
      $set: { _id: responseId, responseId, ...rest },
      $addToSet: {
        customTokens: { $each: tokens },
      },
    },
    { upsert: true, returnNewDocument: true }
  );
  // let newDocument = updateResult.value;
  // if (updateResult?.lastErrorObject?.upserted) {
  const newDocument = await customNormCollection.findOne({
    _id: responseId,
  });
  // }
  return { updateResult, document: newDocument };
};
