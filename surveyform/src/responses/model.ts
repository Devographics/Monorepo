import { SurveyEdition } from "@devographics/core-models";
import {
  createGraphqlModel,
  CreateGraphqlModelOptionsShared,
} from "@vulcanjs/graphql";
import { getSchema, getSurveyResponseSchema, initResponseSchema } from "./schema";

const name = "Response";

let isResponseModelReady = false
let Response
export const getResponseModel = () => {
  if (!isResponseModelReady) throw new Error("Response model not ready")
  return Response
};
export const getModelDef = () => {
  const modelDef: CreateGraphqlModelOptionsShared = {
    name,
    schema: getSchema(),
    graphql: {
      typeName: name,
      multiTypeName: "Responses",
      defaultFragmentOptions: {
        // Some fields might be named "js_features_intl"
        // because they literally talk about _intl
        // we don't want them in the default fragment
        // TODO: we should probably provide our own default fragment
        // without survey fields anyway
        noIntlFields: true,
      },
    },
    permissions: {
      canRead: ["owners", "admins"],
      canCreate: ["members"],
      canUpdate: ['owners', 'admins'],
      canDelete: ["admins"],
    },
  };
  return modelDef
}
export function initReponseModel(surveys: Array<SurveyEdition>) {
  initResponseSchema(surveys)
  return createGraphqlModel(getModelDef())
}

/**
 * Newer version: have one Response model per survey, generated on the fly
 *
 * NOTE: do NOT register in api/graphql, the main model with all fields is still preferred for now.
 * This model is used only to generate forms at this point
 */
export const getSurveyResponseModel = (survey: SurveyEdition) => createGraphqlModel({
  name,
  schema: getSurveyResponseSchema(survey),
  graphql: {
    typeName: name,
    multiTypeName: "Responses",
    defaultFragmentOptions: {
      // Some fields might be named "js_features_intl"
      // because they literally talk about _intl
      // we don't want them in the default fragment
      // TODO: we should probably provide our own default fragment
      // without survey fields anyway
      noIntlFields: true,
    },
  },
  // NOTE: save_survey actually handles the permissions
  permissions: {
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    canUpdate: ['owners', 'admins'],
    canDelete: ["admins"],
  },
})