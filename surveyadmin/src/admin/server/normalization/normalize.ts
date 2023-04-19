import {
  EntityRule,
  generateEntityRules,
  getFieldPaths,
  getEditionFieldById,
} from "./helpers";
import { getOrFetchEntities } from "~/modules/entities/server";
import { getSurveyEditionById } from "~/modules/surveys/helpers";
import {
  NormalizedResponseMongooseModel,
  NormalizedResponseDocument,
} from "~/admin/models/normalized_responses/model.server";
import * as steps from "./steps";
import get from "lodash/get.js";
import type { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { fetchSurveysListGraphQL } from "@devographics/core-models/server";

interface RegularField {
  fieldName: string;
  value: any;
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
  fieldId?: string;
  isBulk?: boolean;
  surveys?: SurveyMetadata[];
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
  fieldId?: string;
  verbose?: boolean;
}

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
      fieldId,
      isBulk = false,
      surveys,
    } = options;

    if (verbose) {
      console.log(`// Normalizing document ${response._id}…`);
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
    let normResp: Partial<NormalizedResponseDocument> = {};
    const privateFields = {};
    const normalizedFields: Array<NormalizedField> = [];
    const prenormalizedFields: Array<RegularField> = [];
    const regularFields: Array<RegularField> = [];

    let updatedNormalizedResponse, allSurveys, allEntities, modifier;

    if (surveys) {
      allSurveys = surveys;
    } else {
      allSurveys = await fetchSurveysListGraphQL({
        apiUrl: process.env.DATA_API_URL,
      });
    }

    const survey = allSurveys.find((s) => s.id === response.surveyId);
    const edition = survey.editions.find((e) => e.id === response.editionId);

    if (!edition)
      throw new Error(`Could not find edition for slug ${response.editionId}`);

    if (entities) {
      allEntities = entities;
    } else {
      console.log("// Getting/fetching entities…");
      allEntities = await getOrFetchEntities();
    }
    const allRules = rules ?? generateEntityRules(allEntities);
    const fileName = _fileName || `${response.surveySlug}_normalization`;

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
      fieldId,
      verbose,
    };

    /*

    Start
    
    */

    if (fieldId) {
      let fullPath;
      // 1. we only need to renormalize a single field
      switch (fieldId) {
        case "source":
          await steps.copyFields(normalizationParams);
          await steps.normalizeSourceField(normalizationParams);
          fullPath = "user_info.source";
          break;
        case "country":
          throw new Error(
            "Please normalize full document in order to normalize country field"
          );
        default:
          const field = getEditionFieldById(edition, fieldId);
          await steps.normalizeField({ field, ...normalizationParams });
          fullPath = getFieldPaths(field).fullPath;
          break;
      }

      const value = get(normResp, fullPath);
      if (!value) {
        // we shouldn't be running field-specific normalization on documents where
        // that field is empty, but handle it just in case
        result.discard = true;
      } else {
        modifier = { $set: { [fullPath]: value } };

        // console.log(JSON.stringify(selector, null, 2));
        // console.log(JSON.stringify(modifier, null, 2));

        if (!isSimulation && !isBulk) {
          // update normalized response, or insert it if it doesn't exist
          // NOTE: this will generate ObjectId _id for unknown reason, see https://github.com/Devographics/StateOfJS-next2/issues/31
          updatedNormalizedResponse =
            await NormalizedResponseMongooseModel.updateOne(selector, modifier);

          if (
            !updatedNormalizedResponse ||
            !updatedNormalizedResponse.matchedCount
          ) {
            console.log(response._id);
            console.log(updatedNormalizedResponse);
            console.log(normResp);
            console.log(selector);
            console.log(modifier);
            throw new Error(
              `Could not find existing normalized response for responseId ${response._id}, normalize entire document first to create it.`
            );
          }
        }
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
      await steps.handlePrivateInfo(normalizationParams);

      modifier = normResp;

      if (!isSimulation && !isBulk) {
        // update normalized response, or insert it if it doesn't exist
        // NOTE: this will generate ObjectId _id for unknown reason, see https://github.com/Devographics/StateOfJS-next2/issues/31
        updatedNormalizedResponse =
          await NormalizedResponseMongooseModel.findOneAndUpdate(
            selector,
            modifier,
            { upsert: true, returnDocument: "after" }
          );
      }
    }
    // eslint-disable-next-line
    // console.log(result);
    return {
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
  } catch (error) {
    console.log("// normalizeResponse error");
    console.log(error);
  }
};
