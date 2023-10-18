import { EntityRule, cleanupValue } from "./helpers";
import { normalize } from "./normalize";
import set from "lodash/set.js";
import {
  CommentField,
  CustomNormalizationToken,
  NormalizationParams,
  NormalizationToken,
  NormalizeFieldResult,
  NormalizedField,
  PrenormalizedField,
  RegularField,
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
          console.log(`⛰️ ${fieldPath}/response: “${responseValue}”`);
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
          console.log(`⛰️ ${fieldPath}/comment: “${responseCommentValue}”`);
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
        set(normResp, normPaths.raw!, prenormalizedValue);
        set(normResp, normPaths.prenormalized!, prenormalizedValue);
        set(normResp, normPaths.patterns!, ["prenormalized"]);
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

  const processFreeformField = async () => {
    // if a field has a "freeform/other" path defined, we normalize its contents
    if (rawPaths.other) {
      const fieldPath = prefixWithEditionId(rawPaths?.other, edition.id);
      const freeformValue = response[fieldPath];
      if (freeformValue) {
        // TODO: do this better
        // currently the textList template is the only one that supports multiple
        // freeform values
        const valuesArray =
          questionObject.template === "textList"
            ? freeformValue
            : convertToArray({ questionObject, value: freeformValue });
        const valuesArrayClean = compact(valuesArray.map(cleanupValue));
        const otherValue = cleanupValue(response[fieldPath]);
        if (valuesArrayClean.length > 0) {
          set(normResp, normPaths.raw!, freeformValue);

          try {
            const normTokens = await normalize({
              values: valuesArrayClean,
              entityRules,
              edition,
              questionObject,
              verbose,
            });

            let allTokens: Array<
              CustomNormalizationToken | NormalizationToken
            > = normTokens;

            // if custom norm. tokens have been defined, also add their id
            if (response.customNormalizations) {
              const customNormalization = response.customNormalizations.find(
                (token) => token.rawPath === fieldPath
              );

              if (customNormalization) {
                // only keep custom token that are not already included in regular norm. tokens
                const customTokens = customNormalization.tokens.filter(
                  (tokenId) => !normTokens.map((t) => t.id).includes(tokenId)
                );
                if (verbose) {
                  console.log(
                    `⛰️ Found custom norm. tokens: [${customTokens.join()}]`
                  );
                }
                allTokens = [
                  ...customTokens.map((token) => ({
                    id: token,
                    pattern: "custom_normalization",
                  })),
                  ...allTokens,
                ];
              }
            }

            // if we only need one token, only keep the first one
            if (questionObject.matchType === "single") {
              allTokens = [allTokens[0]];
            }

            let normIds = allTokens.map((token) => token.id);
            let normPatterns = allTokens.map((token) =>
              token.pattern.toString()
            );

            if (normIds.length > 0) {
              set(normResp, normPaths.other!, normIds);
              set(normResp, normPaths.patterns!, normPatterns);
            } else {
              set(normResp, normPaths.other!, [NO_MATCH]);
            }
            // keep trace of fields that were normalized
            normalizedFields.push({
              questionId: questionObject.id,
              fieldPath,
              value: normIds,
              raw: otherValue,
              normTokens: allTokens,
            });

            modified = true;
            if (verbose) {
              console.log(`⛰️ ${fieldPath}/other: “${otherValue}”`);
              // console.log(`⛰️ -> Tags: ${matchTags.toString()}`);
              console.log(
                `⛰️ -> Normalized values: ${JSON.stringify(allTokens)}`
              );
            }
          } catch (error) {
            set(normResp, normPaths.error!, error.message);
          }
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
              `⛰️ ${rawFieldPath}/${DbPathsEnum.FOLLOWUP_PREDEFINED}: “${predefinedFollowupValue}”`
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
