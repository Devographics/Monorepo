import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { DeleteAITokensParams, RenameTokensParams } from "../../services";

export type DeleteAllTokensData = {
  modifiedCount: number;
  success: string;
};

/*

Delete all AI tokens for a question

*/
export const deleteAITokens = async (params: DeleteAITokensParams) => {
  const { editionId, questionId } = params;
  let modifiedCount = 0,
    success;
  const customNormCollection = await getCustomNormalizationsCollection();
  console.log(
    `// Deleting all associated AI tokens for question ${editionId}/${questionId}…`,
  );

  const selector = {
    editionId,
    questionId,
    aiTokens: { $exists: true },
  };
  const updateResult = await customNormCollection.deleteMany(selector);
  modifiedCount += updateResult.deletedCount;
  success = `→ Deleted ${modifiedCount} tokens`;

  //   console.log(selector)
  //   console.log(success);

  return { modifiedCount, success } as DeleteAllTokensData;
};
