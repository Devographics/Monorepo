/*
 * Schema converter/getters
 */
import { canCreateField, canUpdateField } from "@vulcanjs/permissions";
import { VulcanFieldSchema, VulcanSchema } from "@vulcanjs/schema";
import { getFieldType } from "./utils";

/* getters */
// filter out fields with "." or "$"
export const getValidFields = (schema) => {
  return Object.keys(schema).filter(
    (fieldName) => !fieldName.includes("$") && !fieldName.includes(".")
  );
};

/*

Convert a nested SimpleSchema schema into a JSON object
If flatten = true, will create a flat object instead of nested tree

/* permissions */

/**
 * @method Mongo.Collection.getInsertableFields
 * Get an array of all fields editable by a specific user for a given collection
 * @param {Object} user – the user for which to check field permissions
 */
export const getInsertableFields = function (schema, user) {
  const fields = Object.keys(schema).filter(function (fieldName) {
    var field = schema[fieldName];
    return canCreateField(user, field);
  });
  return fields;
};

/**
 * @method Mongo.Collection.getEditableFields
 * Get an array of all fields editable by a specific user for a given collection (and optionally document)
 * @param {Object} user – the user for which to check field permissions
 */
export const getEditableFields = function (schema, user, document) {
  const fields = Object.keys(schema).filter(function (fieldName) {
    var field = schema[fieldName];
    return canUpdateField(user, field, document);
  });
  return fields;
};

const isNestedSchema = (schema: any): schema is VulcanSchema => {
  return typeof schema === "object";
};

/**
 * Vulcan Schema => Form Schema
 * TODO: type this better
 * @param schema
 * @param options
 * @returns
 */
export const convertSchema = (
  schema: VulcanSchema,
  options: { flatten?: boolean; removeArrays?: boolean } = {}
) => {
  const { flatten = false, removeArrays = true } = options;

  let jsonSchema = {};

  Object.keys(schema).forEach((fieldName) => {
    // exclude array fields
    if (removeArrays && fieldName.includes("$")) {
      return;
    }

    // extract schema
    jsonSchema[fieldName] = getFieldSchema(fieldName, schema);

    // check for existence of nested field
    // and get its schema if possible or its type otherwise
    const subSchemaOrType = getNestedFieldSchemaOrType(fieldName, schema);
    if (subSchemaOrType) {
      // remember the subschema if it exists, allow to customize labels for each group of items for arrays of objects
      jsonSchema[fieldName].arrayFieldSchema = getFieldSchema(
        `${fieldName}.$`,
        schema
      );

      // nested schema can be a field schema ({type, canRead, etc.}) (convertedSchema will be null)
      // or a schema on its own with subfields (convertedSchema will return smth)
      if (isNestedSchema(subSchemaOrType)) {
        // call convertSchema recursively on the subSchema
        const convertedSubSchema = convertSchema(subSchemaOrType, options);
        // subSchema is a full schema with multiple fields (eg array of objects)
        if (flatten) {
          jsonSchema = { ...jsonSchema, ...convertedSubSchema };
        } else {
          jsonSchema[fieldName].schema = convertedSubSchema;
        }
      } else {
        // subSchema is a simple field in this case (eg array of numbers)
        jsonSchema[fieldName].isSimpleArrayField = true; //getFieldSchema(`${fieldName}.$`, schema);
      }
    }
  });
  return jsonSchema;
};

/*

Get a JSON object representing a field's schema

*/
export const getFieldSchema = (fieldName: string, schema: VulcanSchema) => {
  let fieldSchema = {};
  schemaProperties.forEach((property) => {
    const propertyValue = schema[fieldName]?.[property];
    if (propertyValue) {
      fieldSchema[property] = propertyValue;
    }
  });
  return fieldSchema;
};

// type is an array due to the possibility of using SimpleSchema.oneOf
// right now we support only fields with one type
export const getSchemaType = (fieldSchema: VulcanFieldSchema) =>
  getFieldType(fieldSchema);

const getArrayNestedSchema = (fieldName: string, schema: VulcanSchema) => {
  const arrayItemSchema = schema[`${fieldName}.$`];
  const nestedSchema = arrayItemSchema && getSchemaType(arrayItemSchema);
  return nestedSchema;
};

// TODO: not 100% it's valid with current implementation
const isNestedSchemaField = (fieldSchema: VulcanFieldSchema) => {
  const fieldType = getSchemaType(fieldSchema);
  return fieldType && typeof fieldType === "object";
};
const getObjectNestedSchema = (fieldName: string, schema: VulcanSchema) => {
  const fieldSchema = schema[fieldName];
  if (!isNestedSchemaField(fieldSchema)) return null;
  const nestedSchema = fieldSchema && getSchemaType(fieldSchema);
  return nestedSchema;
};
/*

Given an array field, get its nested schema
If the field is not an object, this will return the subfield type instead
*/
export const getNestedFieldSchemaOrType = (fieldName, schema) => {
  const arrayItemSchema = getArrayNestedSchema(fieldName, schema);
  if (!arrayItemSchema) {
    // look for an object schema
    const objectItemSchema = getObjectNestedSchema(fieldName, schema);
    // no schema was found
    if (!objectItemSchema) return null;
    return objectItemSchema;
  }
  return arrayItemSchema;
};

export const schemaProperties = [
  "type",
  "label",
  "optional",
  "required",
  "min",
  "max",
  "exclusiveMin",
  "exclusiveMax",
  "minCount",
  "maxCount",
  "allowedValues",
  "regEx",
  "blackbox",
  "trim",
  "custom",
  "defaultValue",
  "autoValue",
  "hidden", // hidden: true means the field is never shown in a form no matter what
  "mustComplete", // mustComplete: true means the field is required to have a complete profile
  "form", // form placeholder
  "inputProperties", // form placeholder
  "itemProperties",
  "control", // SmartForm control (String or React component)
  "input", // SmartForm control (String or React component)
  "autoform", // legacy form placeholder; backward compatibility (not used anymore)
  "order", // position in the form
  "group", // form fieldset group
  "onCreate", // field insert callback
  "onUpdate", // field edit callback
  "onDelete", // field remove callback
  "onInsert", // OpenCRUD backwards compatibility
  "onEdit", // OpenCRUD backwards compatibility
  "onRemove", // OpenCRUD backwards compatibility
  "canRead",
  "canCreate",
  "canUpdate",
  "viewableBy", // OpenCRUD backwards compatibility
  "insertableBy", // OpenCRUD backwards compatibility
  "editableBy", // OpenCRUD backwards compatibility
  "resolveAs",
  "searchable",
  "description",
  "beforeComponent",
  "afterComponent",
  "placeholder",
  "options",
  "query",
  "queryWaitsForValue",
  "autocompleteQuery",
  "fieldProperties",
  "intl",
  "intlId",
];

export const formProperties = [
  "optional",
  "required",
  "min",
  "max",
  "exclusiveMin",
  "exclusiveMax",
  "minCount",
  "maxCount",
  "allowedValues",
  "regEx",
  "blackbox",
  "trim",
  "custom",
  "defaultValue",
  "autoValue",
  "mustComplete", // mustComplete: true means the field is required to have a complete profile
  "form", // form placeholder
  "inputProperties", // form placeholder
  "itemProperties",
  "control", // SmartForm control (String or React component)
  "input", // SmartForm control (String or React component)
  "order", // position in the form
  "group", // form fieldset group
  "description",
  "beforeComponent",
  "afterComponent",
  "placeholder",
  "options",
  "query",
  "queryWaitsForValue",
  "autocompleteQuery",
  "fieldProperties",
];
