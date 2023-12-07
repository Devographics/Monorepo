import { EntityRule } from "./helpers";
import {
  CommentField,
  NormalizationParams,
  NormalizeFieldResult,
  NormalizedField,
  RegularField,
} from "../types";
import clone from "lodash/clone";
import {
  QuestionTemplateOutput,
  SectionMetadata,
  ResponseDocument,
  EditionMetadata,
  NormalizedResponseDocument,
  CustomNormalizationDocument,
} from "@devographics/types";
import { prefixWithEditionId } from "@devographics/templates";
import {
  comment,
  followup_freeform,
  followup_predefined,
  freeform,
  prenormalized,
  skip,
  response as responseSubfieldFunction,
} from "./subfields";

interface NormalizeFieldOptions extends NormalizationParams {
  questionObject: QuestionTemplateOutput;
  section: SectionMetadata;
  isRenormalization?: boolean;
}

export type SubfieldProcessFunction = (
  props: SubfieldProcessProps
) => Promise<SubfieldProcessResult | void>;

export interface SubfieldProcessProps {
  edition: EditionMetadata;
  response: ResponseDocument;
  normResp: NormalizedResponseDocument;
  questionObject: QuestionTemplateOutput;
  verbose: boolean;
  entityRules: EntityRule[];
  customNormalizations: CustomNormalizationDocument[];
  timestamp: string;
}

export type FieldLogItem = RegularField | NormalizedField | CommentField;

export interface SubfieldProcessResult {
  normResp: NormalizedResponseDocument;
  modifiedFields?: Array<FieldLogItem>;
  isError?: boolean;
}

export const getQuestionPaths = (questionObject: QuestionTemplateOutput) => {
  const { rawPaths, normPaths } = questionObject;
  if (!rawPaths || !normPaths) {
    console.log(questionObject);
    throw new Error(
      `⛰️ normalizeField error: could not find rawPaths or normPaths for question ${questionObject.id}`
    );
  }
  return { rawPaths, normPaths };
};

export const normalizeField = async ({
  response,
  verbose = false,
  questionObject,
  normResp: normResp_,
  edition,
  entityRules,
  isRenormalization,
  customNormalizations,
  timestamp,
}: NormalizeFieldOptions): Promise<NormalizeFieldResult> => {
  let normResp = clone(normResp_);

  const allModifiedFields: {
    [key in string]: Array<FieldLogItem>;
  } = {};

  // only set modified to `true` if at least one sub-step actually modifies the normalized response
  let modified = false;

  const subfieldProcessProps = {
    edition,
    response,
    normResp,
    questionObject,
    modified,
    verbose,
    entityRules,
    customNormalizations,
    timestamp,
  };

  let subfields;
  if (isRenormalization) {
    // when renormalizing an already-normalized response, we only need to worry about the
    // "other" sub-field, since the other ones have already been copied over
    subfields = [freeform, followup_freeform];
  } else {
    // else, when normalizing from scratch we process all sub-fields
    subfields = [
      responseSubfieldFunction,
      comment,
      prenormalized,
      freeform,
      followup_predefined,
      followup_freeform,
      skip,
    ];
  }
  for (const subfieldFunction_ of subfields) {
    const subfieldFunction = subfieldFunction_ as SubfieldProcessFunction;
    const result = await subfieldFunction(subfieldProcessProps);
    if (result) {
      const { normResp: newNormResp, modifiedFields, isError } = result;

      // note: each subfield step will MUTATE the normResp object
      // so this is not strictly necessary currently
      normResp = newNormResp;

      if (!isError) {
        modified = true;
      }

      if (modifiedFields && modifiedFields.length > 0) {
        allModifiedFields[`${modifiedFields}Fields`] = (
          allModifiedFields[`${modifiedFields}Fields`] || []
        ).concat(modifiedFields);

        if (verbose) {
          const { rawPaths } = getQuestionPaths(questionObject);
          const fieldPath =
            rawPaths.response &&
            prefixWithEditionId(rawPaths.response, edition.id);
          console.log(
            `⛰️ ${fieldPath}/${subfieldFunction.name}: “${modifiedFields
              .map((f) => f.value)
              .join("|")}”`
          );
        }
      }
    }
  }

  // TODO: more generic system that is not hardcoded to just four subfield types
  const result = {
    normalizedResponse: normResp,
    modified,
    regularFields: allModifiedFields.responseFields || [],
    normalizedFields: allModifiedFields.freeformFields || [],
    prenormalizedFields: allModifiedFields.prenormalizedFields || [],
    commentFields: allModifiedFields.commentFields || [],
  };
  return result;
};
