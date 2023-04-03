/* 

Differences with vulcan Meteor:

Removed validateDocument and refactored validateData, so now we use only validateData called with mutatorName.

Do not need the GraphQL context, only the current user

*/

import pickBy from "lodash/pickBy.js";
import mapValues from "lodash/mapValues.js";
import {
  VulcanDocument,
  forEachDocumentField,
  VulcanSchema,
} from "@vulcanjs/schema";
import _forEach from "lodash/forEach.js";
import { VulcanModel } from "@vulcanjs/model";
import type { DefaultMutatorName } from "../../typings";
import { canCreateField, canUpdateField } from "@vulcanjs/permissions";
import { toSimpleSchema, ValidationError } from "@vulcanjs/schema";

interface Modifier {
  $set?: Object;
  $unset?: Object;
}
export const dataToModifier = (data: VulcanDocument): Modifier => ({
  $set: pickBy(data, (f) => f !== null),
  $unset: mapValues(
    pickBy(data, (f) => f === null),
    () => true
  ),
});

export const modifierToData = (modifier: Modifier): VulcanDocument => ({
  ...modifier.$set,
  ...mapValues(modifier.$unset, () => null),
});

/**
 * Validate a document permission recursively
 * @param {*} fullDocument (must not be partial since permission logic may rely on full document)
 * @param {*} documentToValidate document to validate
 * @param {*} schema Simple schema
 * @param {*} context Current user and Users collectionœ
 * @param {*} mode create or update
 * @param {*} currentPath current path for recursive calls (nested, nested[0].foo, ...)
 */
const validateDocumentPermissions = (
  fullDocument: VulcanDocument,
  documentToValidate: VulcanDocument,
  schema: VulcanSchema,
  currentUser?: any,
  mode = "create"
  // currentPath = ""
): Array<ValidationError> => {
  let validationErrors: Array<ValidationError> = [];
  forEachDocumentField(
    documentToValidate,
    schema,
    ({ fieldName, fieldSchema, currentPath, isNested }) => {
      if (
        isNested &&
        (!fieldSchema ||
          (mode === "create" ? !fieldSchema.canCreate : !fieldSchema.canUpdate))
      )
        return; // ignore nested without permission
      if (
        !fieldSchema ||
        (mode === "create"
          ? !canCreateField(currentUser, fieldSchema)
          : !canUpdateField(currentUser, fieldSchema, fullDocument))
      ) {
        validationErrors.push({
          id: "errors.disallowed_property_detected",
          properties: {
            name: `${currentPath}${fieldName}`,
          },
        });
      }
    }
  );
  return validationErrors;
};

interface ValidateDataInput {
  originalDocument?: VulcanDocument;
  document: VulcanDocument;
  model: VulcanModel;
  currentUser?: any;
  mutatorName: DefaultMutatorName;
  validationContextName?: string;
}
/*

  If document is not trusted, run validation steps:

  1. Check that the current user has permission to insert each field
  2. Run SimpleSchema validation step

*/
export const validateData = ({
  originalDocument,
  document,
  model,
  currentUser,
  mutatorName,
  validationContextName = "defaultContext", // TODO: what is this?
}: ValidateDataInput): Array<ValidationError> => {
  const { schema } = model;

  let validationErrors: Array<ValidationError> = [];

  // delete mutator has no data, so we skip the simple schema validation
  if (mutatorName === "delete") {
    return validationErrors;
  }
  // validate operation permissions on each field (and other Vulcan-specific constraints)
  validationErrors = validationErrors.concat(
    validateDocumentPermissions(
      originalDocument ? originalDocument : document,
      document,
      schema,
      currentUser,
      mutatorName
    )
  );
  // build the schema on the fly
  // TODO: does it work with nested schema???
  const simpleSchema = toSimpleSchema(schema);
  // run simple schema validation (will check the actual types, required fields, etc....)
  const validationContext = simpleSchema.namedContext(validationContextName);
  // validate the schema, depends on which operation you want to do.
  if (mutatorName === "create") {
    validationContext.validate(document);
  }
  if (mutatorName === "update") {
    const modifier: Modifier = dataToModifier(document);
    const set = modifier.$set;
    const unset = modifier.$unset;
    validationContext.validate(
      { $set: set, $unset: unset },
      { modifier: true, extendedCustomContext: { documentId: document._id } }
    );
  }
  if (!validationContext.isValid()) {
    const errors = (validationContext as any).validationErrors();
    errors.forEach((error) => {
      // eslint-disable-next-line no-console
      // console.log(error);
      if (error.type.includes("intlError")) {
        const intlError = JSON.parse(error.type.replace("intlError|", ""));
        validationErrors = validationErrors.concat(intlError);
      } else {
        validationErrors.push({
          id: `errors.${error.type}`,
          path: error.name,
          properties: {
            modelName: model.name,
            // typeName: collection.options.typeName,
            ...error,
          },
        });
      }
    });
  }

  return validationErrors;
};
