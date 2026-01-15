import {
  getCustomNormalizationsCollection,
  getNormResponsesCollection,
} from "@devographics/mongo";
import { parse } from "csv-parse/sync";
import { getSurveyEditionSectionQuestion } from "../helpers/getSurveyEditionQuestion";
import { getFormPaths } from "@devographics/templates";
import { addCustomTokens } from "./tokens/addCustomTokens";
import get from "lodash/get";
import { NormalizationMetadata } from "@devographics/types";
import { ImportNormalizationArgs } from ".";

interface NormDef {
  rawValue: string;
  entityId: string;
}

type AnswerMatch = {
  index: number;
  answer: string;
  answerId: string;
  tokenIds: string[];
};
type NormalizationJSONPayload = {
  tokens: string[];
  matches: AnswerMatch[];
};

export const importNormalizationsJSON = async (
  args: ImportNormalizationArgs
) => {
  console.log("// importNormalizationsJSON");
  const { surveyId, editionId, questionId, data } = args;

  const { survey, edition, section, question, durations } =
    await getSurveyEditionSectionQuestion({
      surveyId,
      editionId,
      questionId,
    });

  const paths = getFormPaths({ edition, question });

  const parsedData = JSON.parse(data) as NormalizationJSONPayload;

  let normalizationsImported = 0;
  let normalizationsSkipped = 0;

  const rawPath = paths.other!;
  const items = parsedData.matches;

  console.log(
    `// importNormalizationsJSON: found ${items.length} items to import…`
  );

  for (const item of items) {
    const { answer, answerId, tokenIds } = item;
    const [responseId, questionId_, answerIndex] = answerId.split("___");

    if (tokenIds && tokenIds.length > 0) {
      normalizationsImported++;

      const args = {
        surveyId,
        editionId,
        questionId,
        responseId,
        rawPath,
        normPath: question.normPaths?.response!,
        rawValue: answer,
        tokens: tokenIds,
        answerIndex: Number(answerIndex),
        isAI: true,
      };
      const { updateResult } = await addCustomTokens(args);
      console.log(updateResult);
    }
  }
  const success = `importNormalizationsJSON: Done, added ${normalizationsImported} valid normalization tokens`;
  console.log(`// ${success}`);
  return { normalizationsImported, normalizationsSkipped, success };
};
