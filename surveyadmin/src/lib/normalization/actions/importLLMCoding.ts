import { getCustomNormalizationsCollection } from "@devographics/mongo";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";
import {
  importNormalizationsJSON,
  splitRight,
} from "./importNormalizationsJSON";
import { normalizeQuestion } from "./normalizeQuestion";
import { getQuestionResponsesCount } from "./getQuestionResponsesCount";

export type ImportLLMCodingArgs = {
  surveyId: string;
  editionId: string;
  questionId: string;
  // contents of an llm-coding devographics-import.json file (object or JSON string)
  data: any;
  // remove all of the question's existing AI tokens before importing (default: false)
  removeExisting?: boolean;
  // renormalize the question once the tokens are imported (default: true)
  normalize?: boolean;
};

const segmentSize = 1000;

/*

Import an llm-coding devographics-import.json file for one question, in one call:

1. check that every answer in the file belongs to this question
2. (removeExisting) remove the question's existing AI tokens
3. import the file's tokens as AI tokens
4. (normalize) renormalize all of the question's responses

*/
export const importLLMCoding = async (args: ImportLLMCodingArgs) => {
  const {
    surveyId,
    editionId,
    questionId,
    removeExisting = false,
    normalize = true,
  } = args;
  const data =
    typeof args.data === "string" ? args.data : JSON.stringify(args.data);

  // 1. make sure the file was exported for this question
  const parsed = JSON.parse(data);
  if (!Array.isArray(parsed?.matches)) {
    throw new Error("importLLMCoding: data has no `matches` array");
  }
  const wrongQuestionIds = new Set<string>();
  for (const match of parsed.matches) {
    const answerQuestionId = splitRight(match.answerId, "___")[1];
    if (answerQuestionId !== questionId) {
      wrongQuestionIds.add(answerQuestionId);
    }
  }
  if (wrongQuestionIds.size > 0) {
    throw new Error(
      `importLLMCoding: file contains answers for other questions (${[
        ...wrongQuestionIds,
      ].join(", ")}), expected ${questionId}`,
    );
  }

  // 2. remove existing AI tokens (manual customTokens and suggestions are kept)
  let aiTokensRemoved = 0;
  if (removeExisting) {
    const customNormCollection = await getCustomNormalizationsCollection();
    const result = await customNormCollection.deleteMany({
      editionId,
      questionId,
      aiTokens: { $exists: true },
    });
    aiTokensRemoved = result.deletedCount;
    console.log(
      `// importLLMCoding: removed AI tokens from ${aiTokensRemoved} answers`,
    );
  }

  // 3. import
  const importResult = await importNormalizationsJSON({
    surveyId,
    editionId,
    questionId,
    data,
    rawPath: "unknown",
  });

  // 4. renormalize every response for the question, one segment at a time
  let responsesNormalized = 0;
  if (normalize) {
    const { survey, edition, question } = await getSurveyEditionSectionQuestion(
      { surveyId, editionId, questionId },
    );
    const responsesCount = await getQuestionResponsesCount({
      survey,
      edition,
      question,
    });
    const totalSegments = Math.ceil(responsesCount / segmentSize);
    for (let i = 0; i < totalSegments; i++) {
      await normalizeQuestion({
        surveyId,
        editionId,
        questionId,
        startFrom: i * segmentSize,
        limit: segmentSize,
        currentSegmentIndex: i + 1,
        totalSegments,
      });
    }
    responsesNormalized = responsesCount;
  }

  const success = `importLLMCoding: ${questionId}: removed AI tokens from ${aiTokensRemoved} answers, imported ${importResult.normalizationsImported}, renormalized ${responsesNormalized} responses`;
  console.log(`// ${success}`);
  return {
    aiTokensRemoved,
    normalizationsImported: importResult.normalizationsImported,
    responsesNormalized,
    success,
  };
};
