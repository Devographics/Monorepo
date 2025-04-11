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

export interface ImportNormalizationArgs {
  surveyId: string;
  editionId: string;
  questionId: string;
  data: string;
  rawPath: string;
}

interface NormDef {
  rawValue: string;
  entityId: string;
}

export const importNormalizationsCSV = async (
  args: ImportNormalizationArgs
) => {
  const { surveyId, editionId, questionId, data } = args;

  const { survey, edition, section, question, durations } =
    await getSurveyEditionSectionQuestion({ surveyId, editionId, questionId });

  const paths = getFormPaths({ edition, question });

  const normResponsesCollection = await getNormResponsesCollection(survey);
  const custNormCollection = await getCustomNormalizationsCollection();

  const allCustomNormalizations = await custNormCollection
    .find({ surveyId, editionId, questionId })
    .toArray();

  const items = parse(data, {
    columns: true,
    skip_empty_lines: true,
  }) as NormDef[];

  let normalizationsImported = 0;
  let normalizationsSkipped = 0;

  const rawPath = paths.response!;
  const metadataPath = question?.normPaths?.metadata!;
  const itemsWithIds = items.filter((i) => !!i.entityId);

  console.log(
    `// importNormalizations: found ${itemsWithIds.length}/${items.length} items with entityIds to import…`
  );

  for (const item of itemsWithIds) {
    const { rawValue, entityId } = item;
    const selector = {
      editionId,
      [metadataPath]: { $elemMatch: { raw: rawValue } },
    };
    const matchingResponse = await normResponsesCollection.findOne(selector);
    if (matchingResponse) {
      const responseId = matchingResponse._id;

      const metadata = get(
        matchingResponse,
        metadataPath
      ) as NormalizationMetadata[];
      const answerIndex = metadata.findIndex((item) => item.raw === rawValue);
      const metadataItem = metadata[answerIndex];

      // find any custom normalization corresponding do the current answer, if it already exists
      const customNormalization = allCustomNormalizations.find(
        (c) => c.responseId === responseId && c.answerIndex === answerIndex
      );

      const regularTokenExists = metadataItem?.tokens
        ?.map((t) => t.id)
        .includes(entityId);
      const customTokenExists =
        customNormalization?.customTokens?.includes(entityId);

      const tokenAlreadyExists = regularTokenExists || customTokenExists;

      if (tokenAlreadyExists) {
        normalizationsSkipped++;
        console.log(
          `-> ➖ [${responseId}] Token ${entityId} already exists, skipping`
        );
      } else {
        console.log(`-> ✅ [${responseId}] Adding token ${entityId}…`);

        normalizationsImported++;
        const { updateResult } = await addCustomTokens({
          surveyId,
          editionId,
          questionId,
          responseId,
          rawPath,
          normPath: question.normPaths?.response!,
          rawValue,
          tokens: [entityId],
          answerIndex,
        });
        // console.log(updateResult);
      }
    } else {
      // no matching answer
      console.log(
        `-> 🚫 Could not find matching answer for value: ${rawValue}, with selector:`
      );
      console.log(selector);
    }
  }
  console.log(
    `// importNormalizations: Done, added ${normalizationsImported} valid normalization tokens`
  );
  return { normalizationsImported, normalizationsSkipped };
};
