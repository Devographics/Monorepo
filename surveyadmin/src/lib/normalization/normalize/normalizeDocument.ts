import { getEditionQuestionById } from "../helpers/getEditionQuestionById";
import { generateEntityRules } from "./generateEntityRules";
import { getQuestionObject } from "../helpers/getQuestionObject";
import * as steps from "./steps";
import get from "lodash/get.js";
import { fetchEntities, fetchSurveyMetadata } from "@devographics/fetch";
import { fetchEditionMetadataAdmin } from "~/lib/api/fetch";
import {
  NormalizationOptions,
  NormalizationResultSuccessEx,
  NormalizationError,
  NormalizedResponseDocument,
  NormalizedField,
  RegularField,
  NormalizationParams,
  CommentField,
  PrenormalizedField,
  StepFunction,
  NormalizationResultSuccess,
  NormalizationResultError,
  NormalizationResultEmpty,
  NormalizationResultTypes,
} from "../types";
import clone from "lodash/clone";
import { getQuestionPaths, normalizeField } from "./normalizeField";
import { EditionMetadata, ResponseDocument } from "@devographics/types";
import difference from "lodash/difference";
import { fetchEntitiesNormalization } from "./getEntitiesNormalizationQuery";

/*

Normalize an entire document
(can optionally be limited to a specific question if questionId is passed)

27/06/2023: we now assume we are always calling this from a bulk operation
to simplify the logic.

*/

const fetchDataIfNeeded = async (options: NormalizationOptions) => {
  const { response } = options;
  const { surveyId, editionId } = response;
  const survey = options.survey || (await fetchSurveyMetadata({ surveyId }));
  const edition =
    options.edition ||
    (await fetchEditionMetadataAdmin({ surveyId, editionId })).data;
  const entities =
    options.entities || (await fetchEntitiesNormalization()).data;
  const entityRules = options.entityRules || generateEntityRules(entities);
  return {
    survey,
    edition,
    entities,
    entityRules,
  };
};

/**
 *
 * Marks the document with "empty", "errors" etc. depending on the situation
 */
export const normalizeDocument = async (
  options: NormalizationOptions
): Promise<
  | NormalizationResultSuccessEx
  | NormalizationResultEmpty
  | NormalizationResultError
> => {
  let normalizationResult;
  // console.log(
  //   `⛰️ starting normalizeDocument for document ${options.response._id}`
  // );

  try {
    const { response, questionId } = options;
    const { survey, edition, entityRules } = await fetchDataIfNeeded(options);

    if (entityRules.length === 0) {
      throw new Error(`normalizeDocument: entityRules empty.`);
    }

    const errors: NormalizationError[] = [];
    let normResp = {} as NormalizedResponseDocument;

    const normalizationParams: NormalizationParams = {
      ...options,
      normResp,
      survey,
      edition,
      entityRules,
      errors,
    };

    if (responseIsEmpty({ response, edition })) {
      // response is empty, discard operation
      normalizationResult = {
        discard: true,
        type: NormalizationResultTypes.EMPTY,
      } as NormalizationResultEmpty;
      return normalizationResult;
    }

    if (questionId) {
      // 1. we only need to renormalize a single field
      normalizationResult = await normalizeQuestion({
        ...normalizationParams,
        questionId,
      });
    } else {
      // 2. we are normalizing the entire document
      normalizationResult = await normalizeResponse(normalizationParams);
    }

    const normalizationResultExtended = {
      ...normalizationResult,
      response,
      responseId: response._id,
      selector: { responseId: response._id },
      counts: {
        normalized: normalizationResult.normalizedFields.length,
        regular: normalizationResult.regularFields.length,
        comment: normalizationResult.commentFields.length,
        prenormalized: normalizationResult.prenormalizedFields.length,
      },
    };
    return normalizationResultExtended;
  } catch (error) {
    console.log(error);
    // response encountered error, pass on error and discard operation
    normalizationResult = {
      discard: true,
      type: NormalizationResultTypes.ERROR,
      errors: [error.message],
    } as NormalizationResultError;
    return normalizationResult;
  }
};

/*

Normalize single question

*/
const normalizeQuestion = async (
  normalizationParams: NormalizationParams & { questionId: string }
): Promise<NormalizationResultSuccess> => {
  const { verbose, response, survey, edition, questionId } =
    normalizationParams;
  if (verbose) {
    console.log(
      `⛰️ Normalizing document ${response._id}, question ${questionId}…`
    );
  }

  const question = getEditionQuestionById({
    edition,
    questionId: questionId,
  });
  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  });

  if (!questionObject) {
    throw new Error(
      `Cannot normalize question ${questionId} because no questionObject was found. `
    );
  }
  const questionBasePath = questionObject?.normPaths?.base;
  if (!questionBasePath) {
    throw new Error(`Could not find base path for question ${questionId}`);
  }

  // switch (questionId) {
  //   case "source":
  //     await steps.copyFields(normalizationParams);
  //     await steps.normalizeSourceField(normalizationParams);
  //     fullPath = "user_info.source";
  //     break;
  //   case "country":
  //     throw new Error(
  //       "Please normalize full document in order to normalize country field"
  //     );
  //   default:
  //     const normalizeFieldResult = await steps.normalizeField({
  //       question,
  //       section: question.section,
  //       ...normalizationParams,
  //     });
  //     if (normalizeFieldResult.wasModified) {
  //       discard = false;
  //     }
  //     break;
  // }

  const result = await normalizeField({
    questionObject,
    section: question.section,
    ...normalizationParams,
  });

  // if the normalizeField step didn't modify anything, discard the operation
  const discard = !result.modified;
  const value = get(result.normalizedResponse, questionBasePath);
  // we replace the entire "base" question value ("resources.first_steps", "tools.react", etc.),
  // including all sub-fields
  const modifier = { $set: { [questionBasePath]: value } };
  return {
    ...result,
    type: NormalizationResultTypes.SUCCESS,
    modifier,
    discard,
  };
};

/*

Normalize entire response document

*/
const normalizeResponse = async (
  normalizationParams: NormalizationParams
): Promise<NormalizationResultSuccess> => {
  const {
    survey,
    edition,
    verbose,
    response,
    normResp: normResp_,
  } = normalizationParams;
  if (verbose) {
    console.log(`⛰️ Normalizing document ${response._id}…`);
  }

  const fields = {
    prenormalizedFields: [] as PrenormalizedField[],
    normalizedFields: [] as NormalizedField[],
    regularFields: [] as RegularField[],
    commentFields: [] as CommentField[],
  };

  let normResp = clone(normResp_);
  const modifiedArray: boolean[] = [];

  // note: even if the base steps modify the response,
  // we don't count that towards keeping or discarding the operation
  const baseSteps = [
    "copyFields",
    "setUuid",
    "handleLocale",
    "normalizeCountryField",
    // "normalizeSourceField",
  ];
  for (const stepName of baseSteps) {
    const step: StepFunction = steps[stepName];
    normResp = await step({ ...normalizationParams, normResp });
  }

  // loop over all survey questions and normalize (or just copy over) values
  for (const section of edition.sections) {
    for (const question of section.questions) {
      const questionObject = getQuestionObject({
        survey,
        edition,
        section,
        question,
      });

      const { rawPaths, normPaths } = questionObject;
      if (rawPaths && normPaths) {
        const result = await normalizeField({
          ...normalizationParams,
          questionObject,
          section,
          normResp,
        });
        normResp = result.normalizedResponse;
        // concatenate with normalized fields, comment fields, etc. from this field normalization
        for (const fieldType of Object.keys(fields)) {
          fields[fieldType] = [...fields[fieldType], ...result[fieldType]];
        }
        // keep track of whether this normalizeField has actually modified the response
        modifiedArray.push(result.modified);
      } else {
        // some questions (such as intro text, notes, etc.
        // do not have db data associated with them; just skip them
      }
    }
  }

  // if none of the normalizeField steps have modified the response,
  // discard the entire normalization operation
  const discard = modifiedArray.every((modified) => modified === false);
  return {
    // replace entire response with normResp
    modifier: normResp,
    type: NormalizationResultTypes.SUCCESS,
    normalizedResponse: normResp,
    discard,
    ...fields,
  };
};

/**

Check if a response is empty (automatically filled "base" fields 
such as _id, common__user_info__referrer etc. don't count)

Relies on the "steps" definition to identify non-relevant fields

*/
const responseIsEmptyLegacy = ({
  response,
  edition,
}: {
  response: ResponseDocument;
  edition: EditionMetadata;
}) => {
  const baseFields = [
    ...steps.getFieldsToCopy(edition.id).map(([f1, f2]) => f1),
    // keep in sync with "ResponseDocument"
    "_id",
    "isNormalized",
    "duration",
    "locale",
    "lastSavedAt",
  ];
  const responseFields = Object.keys(response);
  // find any response fields that are *not* base fields
  const contentFields = difference(responseFields, baseFields);
  // response is considered empty if it only contains base fields
  return contentFields.length === 0;
};

function responseIsEmpty({
  response,
  edition,
}: {
  response: ResponseDocument;
  edition: EditionMetadata;
}) {
  const contentFields = Object.keys(response).filter((k) =>
    k.startsWith(edition.id)
  );
  return contentFields.length === 0;
}
