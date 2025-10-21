import { getCustomNormalizationsCollection } from "@devographics/mongo";

/*

Get all custom tokens for a given question based on its rawPath

*/
export const getCustomTokens = async ({ rawPath }: { rawPath: string }) => {
  const customNormCollection = await getCustomNormalizationsCollection();
  const result = await customNormCollection
    .find({ rawPath })
    .project({
      responseId: 1,
      normalizationId: 1,
      customTokens: 1,
      aiTokens: 1,
      importedTokens: 1,
      suggestedTokens: 1,
      disabledTokens: 1,
      answerIndex: 1,
    })
    .toArray();
  return result;
};
