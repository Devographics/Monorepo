import { SurveyEdition } from "@devographics/core-models";
import { EditionMetadata } from "@devographics/types";
import { createGraphqlModel } from "@vulcanjs/graphql";
import { getSurveyResponseSchema } from "./schema.client";

const name = "Response";

/**
 * Newer version: have one Response model per survey, generated on the fly
 *
 * NOTE: do NOT register in api/graphql, the main model with all fields is still preferred for now.
 * This model is used only to generate forms at this point
 */
export const getSurveyResponseModel = (edition: EditionMetadata) =>
  createGraphqlModel({
    name,
    schema: getSurveyResponseSchema(edition),
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
      canUpdate: ["owners", "admins"],
      canDelete: ["admins"],
    },
  });
