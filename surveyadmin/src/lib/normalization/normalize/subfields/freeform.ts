import { cleanupValue } from "../helpers";
import { normalize } from "../normalize";
import set from "lodash/set.js";
import { NormalizationMetadata, NormalizationToken } from "../../types";
import { prefixWithEditionId } from "@devographics/templates";
import {
  NO_MATCH,
  DISCARDED_ANSWER,
  CUSTOM_NORMALIZATION,
} from "@devographics/constants";
import compact from "lodash/compact";
import pick from "lodash/pick";
import {
  FieldLogItem,
  SubfieldProcessFunction,
  SubfieldProcessProps,
  getQuestionPaths,
} from "../normalizeField";
import { QuestionTemplateOutput } from "@devographics/types";

// TODO: do this better
// currently the textList template is the only one that supports multiple
// freeform values
const freeformArrayTemplates = ["textList"];

const convertToArray = ({
  questionObject,
  value,
}: {
  questionObject: QuestionTemplateOutput;
  value: string;
}) => {
  if (questionObject.allowOther) {
    // this is a question with an "Other…" checkbox, assume
    // values are comma-separated
    return value.split(",");
  } else {
    // if not, assume there's only a single value
    // and return it as a single-item array
    return [value];
  }
};

export const freeform: SubfieldProcessFunction = async ({
  edition,
  response,
  normResp,
  questionObject,
  entityRules,
  verbose,
}: SubfieldProcessProps) => {
  const modifiedFields: FieldLogItem[] = [];

  const { rawPaths, normPaths } = getQuestionPaths(questionObject);
  // if a field has a "freeform/other" path defined, we normalize its contents
  if (rawPaths.other) {
    const fieldPath = prefixWithEditionId(rawPaths?.other, edition.id);
    const freeformValue = response[fieldPath];
    if (freeformValue) {
      try {
        const valuesArray = freeformArrayTemplates.includes(
          questionObject.template
        )
          ? freeformValue
          : (convertToArray({
              questionObject,
              value: freeformValue,
            }) as string[]);

        const valuesArrayClean = compact(
          valuesArray.map(cleanupValue)
        ) as string[];
        if (valuesArrayClean.length > 0) {
          // set(normResp, normPaths.raw!, freeformValue);

          let normalizedIds = [] as string[];
          let metadata = [] as NormalizationMetadata[];
          let i = 0;
          for (const raw of valuesArrayClean) {
            let tokens = (await normalize({
              values: [raw],
              entityRules,
              edition,
              questionObject,
              verbose,
            })) as NormalizationToken[];

            // if custom norm. tokens have been defined, also add their id
            if (response.customNormalizations) {
              const customNormalization = response.customNormalizations.find(
                (token) => token.rawValue === raw
              );

              if (customNormalization) {
                // only keep custom token that are not already included in regular norm. tokens
                const customTokens = customNormalization.tokens
                  .filter(
                    (tokenId) => !tokens.map((t) => t.id).includes(tokenId)
                  )
                  .map((token) => ({
                    id: token,
                    pattern: CUSTOM_NORMALIZATION,
                  }));
                if (verbose) {
                  console.log(
                    `⛰️ Found custom normalization tokens: [${customTokens
                      .map((t) => t.id)
                      .join()}]`
                  );
                }
                tokens = [...customTokens, ...tokens];
              }
            }

            if (verbose) {
              console.log(
                `⛰️ processFreeformField: ${fieldPath}/other/${i}: “${raw}” -> [${
                  tokens.length > 0 ? tokens.map((t) => t.id).join() : "🚫"
                }]`
              );
            }

            const item = { raw } as NormalizationMetadata;
            if (tokens.length > 0) {
              item.tokens = tokens.map((t) => pick(t, ["id", "pattern"]));

              // only add token ids that are not already in the normalizedIds array
              // and also exclude "DISCARDED_ANSWER" special tokens
              const normalizedIdsToAdd = tokens
                .map((t) => t.id)
                .filter((id) => id !== DISCARDED_ANSWER)
                .filter((id) => !normalizedIds.includes(id));

              normalizedIds = [...normalizedIds, ...normalizedIdsToAdd];
            } else {
              normalizedIds.push(NO_MATCH);
            }
            metadata.push(item);

            i++;
          }

          // if we only need one token, only keep the first one
          if (questionObject.matchType === "single") {
            normalizedIds = normalizedIds.slice(0, 1);
          }

          // modify normalized response object
          set(normResp, normPaths.metadata!, metadata);
          set(normResp, normPaths.other!, normalizedIds);

          // keep trace of fields that were normalized
          modifiedFields.push({
            questionId: questionObject.id,
            fieldPath,
            value: normalizedIds,
            metadata,
          });

          return { normResp, modifiedFields };
        }
      } catch (error) {
        console.warn(error);
        set(normResp, normPaths.error!, error.message);
        return { normResp, isError: true };
      }
    }
  }
};
