export const defaultFieldSchema = {
  type: String,
  canRead: ["guests", "anyone"],
  canCreate: ["guests", "anyone"],
  canUpdate: ["guests", "anyone"],
};

import { VulcanFieldSchema } from "@vulcanjs/schema";
import fromPairs from "lodash/fromPairs.js";
import mapValues from "lodash/mapValues.js";
import SimpleSchema from "simpl-schema";

/**
 * Add basic options (permissions, type) to a partialSchema
 * @param partialSchema
 * @returns
 */
export const withDefaultFieldSchema = (
  partialSchema: Partial<VulcanFieldSchema>
) =>
  mapValues(partialSchema, (fieldSchema) => ({
    ...defaultFieldSchema,
    ...fieldSchema,
  }));

const basicTypes = [
  ["String", String],
  ["Date", Date],
  ["Boolean", Boolean],
  ["Number", Number],
  ["SimpleSchema.Integer", SimpleSchema.Integer],
];
// A schema with all basic possible types
export const basicFieldsSchema = withDefaultFieldSchema(
  fromPairs([
    // native inputs
    ...basicTypes.map(([name, type]) => [name, { type }]),
    ...["password", "url", "email", "textarea", "statictext"].map((input) => {
      const fieldName = `string-${input}`;
      return [
        fieldName,
        {
          type: String,
          input,
        },
      ];
    }),
    ["date-datetime", { type: Date, input: "datetime" }],
    ["date-date", { type: Date, input: "date" }],
    ["date-time", { type: Date, input: "time" }],
    /*
  TODO:
  likert: {},
  */
  ])
);
