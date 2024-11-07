import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { CustomNormalizationParams } from "@devographics/types";
import { getNormalizationId } from "./addCustomTokens";

/*

Specify one or more regex tokens to be disabled

*/
export const disableRegularTokens = async (
  params: CustomNormalizationParams
) => {
  const { tokens, ...rest } = params;
  const normalizationId = getNormalizationId(params);
  const customNormCollection = await getCustomNormalizationsCollection();
  const updateResult = await customNormCollection.updateOne(
    { normalizationId },
    {
      $set: { normalizationId, ...rest },
      $addToSet: {
        disabledTokens: { $each: tokens },
      },
    },
    { upsert: true }
  );
  const document = await customNormCollection.findOne({ normalizationId });
  return { action: "disableRegularTokens", updateResult, document };
};
