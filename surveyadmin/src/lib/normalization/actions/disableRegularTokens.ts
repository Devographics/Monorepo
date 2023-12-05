import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { CustomNormalizationDocument } from "@devographics/types";

export type DisableRegularTokensProps = Omit<
  CustomNormalizationDocument,
  "customTokens" | "disabledTokens"
> & { tokens: string[] };

/*

Specify one or more regex tokens to be disabled

*/
export const disableRegularTokens = async (
  props: DisableRegularTokensProps
) => {
  const { responseId, tokens, ...rest } = props;
  const customNormCollection = await getCustomNormalizationsCollection();
  const updateResult = customNormCollection.updateOne(
    { responseId },
    {
      $set: { _id: responseId, responseId, ...rest },
      $addToSet: {
        disabledTokens: { $each: tokens, returnNewDocument: true },
      },
    },
    { upsert: true }
  );
  const document = await customNormCollection.findOne({
    _id: responseId,
  });
  return { action: "disableRegularTokens", updateResult, document };
};
