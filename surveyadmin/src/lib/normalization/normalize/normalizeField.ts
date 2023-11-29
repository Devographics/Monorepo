import { EntityRule, cleanupValue } from "./helpers";
import { normalize } from "./normalize";
import set from "lodash/set.js";
import {
  CommentField,
  CustomNormalizationToken,
  NormalizationParams,
  FullNormalizationToken,
  NormalizeFieldResult,
  NormalizedField,
  PrenormalizedField,
  RegularField,
  NormalizationMetadata,
  NormalizationToken,
} from "../types";
import clone from "lodash/clone";
import {
  QuestionTemplateOutput,
  SectionMetadata,
  DbPathsEnum,
} from "@devographics/types";
import { getFieldsToCopy } from "./steps";
import { prefixWithEditionId } from "@devographics/templates";
import { NO_MATCH } from "@devographics/constants";
import compact from "lodash/compact";
import pick from "lodash/pick";
import uniq from "lodash/uniq";

interface NormalizeFieldOptions extends NormalizationParams {
  questionObject: QuestionTemplateOutput;
  section: SectionMetadata;
  isRenormalization?: boolean;
}

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

export const normalizeField = async ({
  response,
  verbose = false,
  questionObject,
  normResp: normResp_,
  edition,
  entityRules,
  isRenormalization,
}: NormalizeFieldOptions): Promise<NormalizeFieldResult> => {
  const normResp = clone(normResp_);

  const prenormalizedFields: PrenormalizedField[] = [];
  const normalizedFields: NormalizedField[] = [];
  const regularFields: RegularField[] = [];
  const commentFields: CommentField[] = [];

  // only set modified to `true` if at least one sub-step actually modifies the normalized response
  let modified = false;

  const { template, rawPaths, normPaths } = questionObject;

  if (!rawPaths || !normPaths) {
    console.log(questionObject);
    throw new Error(
      `⛰️ normalizeField error: could not find rawPaths or normPaths for question ${questionObject.id}`
    );
  }

  const processSkipField = () => {
    if (rawPaths.skip) {
      const fieldPath = prefixWithEditionId(rawPaths?.skip, edition.id);
      const skipValue = !!response[fieldPath];
      if (skipValue) {
        const skippedQuestions = normResp.skipped || [];
        normResp.skipped = [...skippedQuestions, questionObject.id];
      }
    }
  };

  const processResponseField = async () => {
    // start by copying over the "main" response value
    if (rawPaths.response && normPaths.response) {
      const fieldPath = prefixWithEditionId(rawPaths.response, edition.id);
      const responseValue = response[fieldPath];
      if (typeof responseValue !== "undefined") {
        set(normResp, normPaths.response!, responseValue);
        regularFields.push({
          questionId: questionObject.id,
          fieldPath,
          value: responseValue,
        });
        modified = true;
        if (verbose) {
          console.log(
            `⛰️ processResponseField: ${fieldPath}/response: “${responseValue}”`
          );
        }
      }
    }
  };

  const processCommentField = async () => {
    // copy over the comment value
    if (rawPaths.comment) {
      const fieldPath = prefixWithEditionId(rawPaths.comment, edition.id);
      const responseCommentValue = cleanupValue(response[fieldPath]);
      if (responseCommentValue) {
        set(normResp, normPaths.comment!, responseCommentValue);
        commentFields.push({
          questionId: questionObject.id,
          fieldPath,
          value: responseCommentValue,
        });
        modified = true;
        if (verbose) {
          console.log(
            `⛰️ processCommentField: ${fieldPath}/comment: “${responseCommentValue}”`
          );
        }
      }
    }
  };

  const processPrenormalizedField = async () => {
    // when encountering a prenormalized field, we just copy its value as is
    if (rawPaths.prenormalized) {
      const fieldPath = prefixWithEditionId(
        rawPaths?.prenormalized,
        edition.id
      );
      const prenormalizedValue = response[fieldPath];
      if (prenormalizedValue) {
        set(normResp, normPaths.prenormalized!, prenormalizedValue);
        prenormalizedFields.push({
          questionId: questionObject.id,
          fieldPath,
          value: prenormalizedValue,
        });
        modified = true;
        if (verbose) {
          console.log(`${fieldPath}/prenormalized: “${prenormalizedValue}”`);
        }
      }
    }
  };

  // TODO: do this better
  // currently the textList template is the only one that supports multiple
  // freeform values
  const freeformArrayTemplates = ["textList"];

  const processFreeformField = async () => {
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
                      pattern: "custom_normalization",
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
                const normalizedIdsToAdd = tokens
                  .map((t) => t.id)
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
            normalizedFields.push({
              questionId: questionObject.id,
              fieldPath,
              value: normalizedIds,
              metadata,
            });

            modified = true;
          }
        } catch (error) {
          console.warn(error);
          set(normResp, normPaths.error!, error.message);
        }
      }
    }
  };

  const processPredefinedFollowupField = async () => {
    const rawPredefinedFollowupPaths =
      rawPaths[DbPathsEnum.FOLLOWUP_PREDEFINED];
    const normPredefinedFollowupPaths =
      normPaths[DbPathsEnum.FOLLOWUP_PREDEFINED];
    if (rawPredefinedFollowupPaths && normPredefinedFollowupPaths) {
      // if field has both a source raw path and a target norm. path defined, proceed
      const subPathKeys = Object.keys(rawPredefinedFollowupPaths);
      for (const subPathKey of subPathKeys) {
        // go through each follow-up subPath and see if it contains a value
        const rawFieldPath = prefixWithEditionId(
          rawPredefinedFollowupPaths[subPathKey],
          edition.id
        );
        const normFieldPath = normPredefinedFollowupPaths[subPathKey];
        const predefinedFollowupValue = cleanupValue(response[rawFieldPath]);

        if (predefinedFollowupValue) {
          // if value exists copy it over to norm. response document
          set(normResp, normFieldPath, predefinedFollowupValue);
          regularFields.push({
            questionId: questionObject.id,
            fieldPath: rawFieldPath,
            value: predefinedFollowupValue,
          });
          modified = true;
          if (verbose) {
            console.log(
              `⛰️ processPredefinedFollowupField: ${rawFieldPath}/${DbPathsEnum.FOLLOWUP_PREDEFINED}: “${predefinedFollowupValue}”`
            );
          }
        }
      }
    }
  };

  const processFreeformFollowupField = async () => {
    // not implemented yet
  };

  if (isRenormalization) {
    // when renormalizing an already-normalized response, we only need to worry about the
    // "other" sub-field, since the other ones have already been copied over
    await processFreeformField();
    await processFreeformFollowupField();
  } else {
    // else, when normalizing from scratch we process all sub-fields
    await processResponseField();
    await processCommentField();
    await processPrenormalizedField();
    await processFreeformField();
    await processPredefinedFollowupField();
    await processFreeformFollowupField();
    await processSkipField();
  }

  const result = {
    normalizedResponse: normResp,
    modified,
    regularFields,
    normalizedFields,
    prenormalizedFields,
    commentFields,
  };
  return result;
};
