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

function splitRight(str: string, sep: string): string[] {
  if (sep === "") return [...str];

  const parts: string[] = [];
  let start = 0;
  let i = 0;

  while (i <= str.length - sep.length) {
    // split here only if the separator matches at i,
    // but NOT at i + 1 (prefer the rightmost match in a run)
    if (str.startsWith(sep, i) && !str.startsWith(sep, i + 1)) {
      parts.push(str.slice(start, i));
      i += sep.length;
      start = i;
    } else {
      i++;
    }
  }

  parts.push(str.slice(start));
  return parts;
}

export const importNormalizationsJSON = async (
  args: ImportNormalizationArgs,
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
    `// importNormalizationsJSON: found ${items.length} items to import…`,
  );

  for (const item of items) {
    const { answer, answerId, tokenIds } = item;
    // note: mongo ids can sometimes end with _ so use custom splitRight function
    const [responseId, questionId_, answerIndex] = splitRight(answerId, "___");

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
