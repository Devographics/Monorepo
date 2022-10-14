import {
  generateEntityRules,
  getFieldPaths,
  getSurveyFieldById,
} from "./helpers";
import { getOrFetchEntities } from "~/modules/entities/server";
import { getSurveyBySlug } from "~/modules/surveys/helpers";
import {
  NormalizedResponseMongooseModel,
  NormalizedResponseDocument,
} from "~/admin/models/normalized_responses/model.server";
import { ResponseAdminMongooseModel } from "@devographics/core-models/server";
import * as steps from "./steps";
import get from "lodash/get.js";

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

  errors: Array<NormalizationError>;

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
  fieldId?: String;
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
    } = options;

    if (verbose) {
      console.log(`// Normalizing document ${response._id}…`);
    }

    /*

    Init

    */
    const result = {
      response,
      responseId: response?._id,
    };
    const errors: NormalizationError[] = [];
    let normResp: Partial<NormalizedResponseDocument> = {};
    const privateFields = {};
    const normalizedFields: Array<NormalizedField> = [];
    const prenormalizedFields: Array<RegularField> = [];
    const regularFields: Array<RegularField> = [];

    const survey = getSurveyBySlug(response.surveySlug);
    if (!survey)
      throw new Error(`Could not find survey for slug ${response.surveySlug}`);

    let updatedNormalizedResponse;
    let allEntities;
    if (entities) {
      allEntities = entities;
    } else {
      console.log("// Getting/fetching entities…");
      allEntities = await getOrFetchEntities();
    }
    const allRules = rules ?? generateEntityRules(allEntities);
    const fileName = _fileName || `${response.surveySlug}_normalization`;

    const normalizationParams = {
      response,
      normResp,
      prenormalizedFields,
      normalizedFields,
      regularFields,
      options,
      fileName,
      survey,
      allRules,
      privateFields,
      result,
      errors,
      fieldId,
    };

    /*

    Start
    
    */

    if (fieldId) {
      let basePath;
      // 1. we only need to renormalize a single field
      switch (fieldId) {
        case "source":
          await steps.copyFields(normalizationParams);
          await steps.normalizeSourceField(normalizationParams);
          basePath = "user_info.source";
          break;
        case "country":
          throw new Error(
            "Please normalize full document in order to normalize country field"
          );
        default:
          const field = getSurveyFieldById(survey, fieldId);
          await steps.normalizeField({ field, ...normalizationParams });
          basePath = getFieldPaths(field).basePath;
          break;
      }

      const selector = { responseId: response._id };
      const value = get(normResp, basePath);
      const modifier = { $set: { [basePath]: value } };

      // console.log(JSON.stringify(selector, null, 2))
      // console.log(JSON.stringify(modifier, null, 2))

      if (!isSimulation) {
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
    } else {
      // 2. we are normalizing the entire document

      // copy fields that don't need any processing
      await steps.copyFields(normalizationParams);

      // set UUID using emailHash
      await steps.setUuid(normalizationParams);

      // handle locale field
      await steps.handleLocale(normalizationParams);

      // loop over all survey questions and normalize (or just copy over) values
      for (const s of survey.outline) {
        for (const field_ of s.questions) {
          await steps.normalizeField({ field: field_, ...normalizationParams });
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

      if (!isSimulation) {
        // update normalized response, or insert it if it doesn't exist
        // NOTE: this will generate ObjectId _id for unknown reason, see https://github.com/Devographics/StateOfJS-next2/issues/31
        updatedNormalizedResponse =
          await NormalizedResponseMongooseModel.findOneAndUpdate(
            { responseId: response._id },
            normResp,
            { upsert: true, returnDocument: "after" }
          );
        await ResponseAdminMongooseModel.updateOne(
          { _id: response._id },
          {
            $set: {
              // NOTE: at the time of writing 09/2022 this is not really used by the app
              // the admin area resolve the normalizedResponse based on its responseId (instead of using response.normalizedResponseId)
              // using a reversed relation
              normalizedResponseId: updatedNormalizedResponse._id,
              isNormalized: true,
            },
          }
        );
      }

      // eslint-disable-next-line
      // console.log(result);
      return {
        ...result,
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
    }
  } catch (error) {
    console.log("// normalizeResponse error");
    console.log(error);
  }
};
