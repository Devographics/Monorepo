import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { CustomNormalizationParams } from "@devographics/types";

export const getNormalizationId = ({
  responseId,
  questionId,
  answerIndex,
}: {
  responseId: string;
  questionId: string;
  answerIndex: number;
}) => `${responseId}__${questionId}__${answerIndex}`;

/*

Add one or more tokens to a custom normalization entry, or create it if 
it doesn't exist yet

*/
export const addCustomTokens = async (params: CustomNormalizationParams) => {
  const { tokens, isSuggestion, ...rest } = params;
  const normalizationId = getNormalizationId(params);
  const customNormCollection = await getCustomNormalizationsCollection();
  const updateResult = await customNormCollection.findOneAndUpdate(
    { normalizationId },
    {
      $set: {
        normalizationId,
        ...rest,
      },
      $addToSet: {
        [isSuggestion ? "suggestedTokens" : "customTokens"]: { $each: tokens },
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  // TODO: it should be possible to avoid having to make a separate query,
  // but somehow findOneAndUpdate doesn't return a document when upserting. bug?
  // let newDocument = updateResult.value;
  // if (updateResult?.lastErrorObject?.upserted) {
  const document = await customNormCollection.findOne({ normalizationId });
  // }
  return { action: "addCustomTokens", updateResult, document };
};
