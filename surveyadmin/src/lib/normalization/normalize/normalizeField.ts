import { EntityRule, cleanupValue, normalize } from "./helpers";
import set from "lodash/set.js";
import {
  CommentField,
  NormalizationParams,
  NormalizeFieldResult,
  NormalizedField,
  PrenormalizedField,
  RegularField,
} from "../types";
import clone from "lodash/clone";
import { QuestionTemplateOutput, SectionMetadata } from "@devographics/types";
import { getFieldsToCopy } from "./steps";
import { prefixWithEditionId } from "@devographics/templates";
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

  const processResponseField = async () => {
    // start by copying over the "main" response value
    if (rawPaths.response && normPaths.response) {
      const fieldPath = prefixWithEditionId(rawPaths.response, edition.id);
      const responseValue = cleanupValue(response[fieldPath]);
      if (responseValue) {
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
        const valuesArray = questionObject.allowMultiple
          ? freeformValue
          : convertToArray(freeformValue);
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

            const normIds = normTokens.map((token) => token.id);
            const normPatterns = normTokens.map((token) =>
              token.pattern.toString()
            );
            set(normResp, normPaths.other!, normIds);
            set(normResp, normPaths.patterns!, normPatterns);

            // keep trace of fields that were normalized
            normalizedFields.push({
              questionId: questionObject.id,
              fieldPath,
              value: normIds,
              raw: otherValue,
              normTokens,
            });

            modified = true;
            if (verbose) {
              console.log(`⛰️ ${fieldPath}/other: “${otherValue}”`);
              // console.log(`⛰️ -> Tags: ${matchTags.toString()}`);
              console.log(
                `⛰️ -> Normalized values: ${JSON.stringify(normTokens)}`
              );
            }
          } catch (error) {
            set(normResp, normPaths.error!, error.message);
          }
        }
      }
    }
  };

  if (isRenormalization) {
    // when renormalizing an already-normalized response, we only need to worry about the
    // "other" sub-field, since the other ones have already been copied over
    await processFreeformField();
  } else {
    // else, when normalizing from scratch we process all sub-fields
    await processResponseField();
    await processCommentField();
    await processPrenormalizedField();
    await processFreeformField();
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
