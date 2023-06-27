import {
  EntityRule,
  generateEntityRules,
  getEditionQuestionById,
  getQuestionObject,
} from "./helpers";
import * as steps from "./steps";
import get from "lodash/get.js";
import type {
  EditionMetadata,
  ResponseDocument,
  Survey,
  SurveyMetadata,
  SectionMetadata,
} from "@devographics/types";
import {
  fetchEditionMetadata,
  fetchEntities,
  fetchSurveysMetadata,
} from "~/lib/api/fetch";
import { getNormResponsesCollection } from "@devographics/mongo";
import { newMongoId } from "@devographics/mongo";

interface RegularField {
  fieldPath: string;
  value: any;
  normTokens?: any[];
}
interface NormalizedField extends RegularField {
  normTokens: Array<string>;
}
interface NormalizationError {
  type: string;
  documentId: string;
}

interface NormalizationResult {
  response: any;
  responseId: string;

  selector: any;
  modifier: any;

  errors: Array<NormalizationError>;
  discard?: boolean;

  normalizedResponseId?: string;
  normalizedResponse?: any;

  normalizedFields?: Array<NormalizedField>;
  prenormalizedFields?: Array<RegularField>;
  regularFields?: Array<RegularField>;

  normalizedFieldsCount?: number;
  prenormalizedFieldsCount?: number;
  regularFieldsCount?: number;
}

interface NormalizationOptions {
  document: any;
  entities?: Array<any>;
  rules?: any;
  log?: Boolean;
  fileName?: string;
  verbose?: boolean;
  isSimulation?: boolean;
  questionId?: string;
  isBulk?: boolean;
  surveys?: SurveyMetadata[];
  isRenormalization?: boolean;
}

export interface NormalizationParams {
  response: any;
  normResp: any;
  prenormalizedFields: RegularField[];
  normalizedFields: RegularField[];
  regularFields: RegularField[];
  options: NormalizationOptions;
  fileName?: string;
  survey: SurveyMetadata;
  edition: EditionMetadata;
  allRules: EntityRule[];
  privateFields?: any;
  result?: any;
  errors?: any;
  questionId?: string;
  verbose?: boolean;
  isRenormalization?: boolean;
}

export interface NormalizedResponseDocument extends ResponseDocument {
  responseId: ResponseDocument["_id"];
  generatedAt: Date;
  surveyId: SurveyMetadata["id"];
  editionId: EditionMetadata["id"];
}

/*

27/06/2023: we now assume we are always calling this from a bulk operation
to simplify the logic.

*/
export const normalizeResponse = async (
  options: NormalizationOptions
): Promise<NormalizationResult | undefined> => {
  try {
    const {
      document: response,
      entities,
      rules,
      log = false,
      fileName: _fileName,
      verbose = false,
      isSimulation = false,
      questionId,
      isBulk = false,
      surveys,
      isRenormalization,
    } = options;

    if (verbose) {
      console.log(
        `⛰️ Normalizing document ${response._id}${
          questionId ? `, question ${questionId}` : ""
        }…`
      );
    }

    /*

    Init

    */
    const selector = { responseId: response._id };

    const result = {
      response,
      responseId: response?._id,
      selector,
      discard: false,
    };

    const errors: NormalizationError[] = [];
    let normResp: Partial<NormalizedResponseDocument> = {
      _id: newMongoId(), // generate a string _id, in case of insert
    };
    const privateFields = {};
    const normalizedFields: Array<NormalizedField> = [];
    const prenormalizedFields: Array<RegularField> = [];
    const regularFields: Array<RegularField> = [];

    let updatedNormalizedResponse, allSurveys, allEntities, modifier;

    if (surveys) {
      allSurveys = surveys;
    } else {
      allSurveys = await fetchSurveysMetadata();
    }

    const survey = allSurveys.find((s) => s.id === response.surveyId);
    const edition = await fetchEditionMetadata({
      surveyId: response.surveyId,
      editionId: response.editionId,
    });

    if (!edition)
      throw new Error(`Could not find edition for id ${response.editionId}`);

    if (entities) {
      allEntities = entities;
    } else {
      console.log("// Getting/fetching entities…");
      allEntities = await fetchEntities();
    }
    const allRules = rules ?? generateEntityRules(allEntities);
    const fileName = _fileName || `${response.surveyId}_normalization`;

    const normalizationParams: NormalizationParams = {
      response,
      normResp,
      prenormalizedFields,
      normalizedFields,
      regularFields,
      options,
      fileName,
      survey,
      edition,
      allRules,
      privateFields,
      result,
      errors,
      questionId,
      verbose,
      isRenormalization,
    };

    /*

    Start
    
    */

    if (questionId) {
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
      const questionBasePath = questionObject?.normPaths?.base;
      if (!questionBasePath) {
        throw new Error(`Could not find base path for question ${questionId}`);
      }

      // 1. we only need to renormalize a single field
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

      const normalizeFieldResult = await steps.normalizeField({
        question,
        section: question.section,
        ...normalizationParams,
      });

      const value = get(normResp, questionBasePath);

      if (normalizeFieldResult.discard) {
        // if none of the question fields contained valid data, discard the operation
        result.discard = true;
      } else {
        modifier = { $set: { [questionBasePath]: value } };

        // console.log(JSON.stringify(selector, null, 2));
        // console.log(JSON.stringify(modifier, null, 2));
      }
    } else {
      // 2. we are normalizing the entire document

      // copy fields that don't need any processing
      await steps.copyFields(normalizationParams);

      // set UUID using emailHash
      await steps.setUuid(normalizationParams);

      // handle locale field
      await steps.handleLocale(normalizationParams);

      // loop over all survey questions and normalize (or just copy over) values
      for (const section of edition.sections) {
        for (const question of section.questions) {
          await steps.normalizeField({
            question,
            section,
            ...normalizationParams,
          });
        }
      }

      // handle country field
      await steps.normalizeCountryField(normalizationParams);

      // handle source fields
      await steps.normalizeSourceField(normalizationParams);

      // discard any response that is still empty after all this
      await steps.discardEmptyResponses(normalizationParams);

      // handle private info (legacy)
      // await steps.handlePrivateInfo(normalizationParams);

      // replace entire response with normResp
      modifier = normResp;
    }

    const normalizationResult = {
      ...result,
      modifier,
      normalizedResponse: normResp,
      normalizedResponseId: updatedNormalizedResponse?._id,
      normalizedFields,
      normalizedFieldsCount: normalizedFields.length,
      prenormalizedFields,
      prenormalizedFieldsCount: prenormalizedFields.length,
      regularFields,
      regularFieldsCount: regularFields.length,
      errors,
    };
    return normalizationResult;
  } catch (error) {
    console.log("// normalizeResponse error");
    console.log(error);
  }
};
