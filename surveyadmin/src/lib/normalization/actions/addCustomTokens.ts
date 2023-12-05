import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { CustomNormalizationDocument } from "@devographics/types";

export type AddCustomTokensProps = Omit<
  CustomNormalizationDocument,
  "customTokens" | "disabledTokens"
> & { tokens: string[] };

/*

Add one or more tokens to a custom normalization entry, or create it if 
it doesn't exist yet

*/
export const addCustomTokens = async (props: AddCustomTokensProps) => {
  const { responseId, tokens, ...rest } = props;
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
  // TODO: it should be possible to avoid having to make a separate query,
  // but somehow findOneAndUpdate doesn't return a document when upserting. bug?
  // let newDocument = updateResult.value;
  // if (updateResult?.lastErrorObject?.upserted) {
  const document = await customNormCollection.findOne({
    _id: responseId,
  });
  // }
  return { action: "addCustomTokens", updateResult, document };
};
