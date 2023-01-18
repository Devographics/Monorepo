import type { VulcanFieldType, VulcanCoreInput } from "@vulcanjs/schema";
// import SimpleSchema from "simpl-schema";

export const standardInputs: Array<VulcanCoreInput> = [
  "number",
  "url",
  "email",
  "textarea",
  "checkbox",
  "checkboxgroup",
  "radiogroup",
  "select",
  "selectmultiple",
  "datetime",
  "date",
  "time",
  "text",
  "password",
];

export const clearableInputs: Array<VulcanCoreInput> = [
  "date",
  //  "date2",
  "datetime",
  "time",
  "select",
  "radiogroup",
];
export const advancedInputs: Array<VulcanCoreInput> = [
  "likert",
  "autocomplete",
  "multiautocomplete",
];
export type DerivedInput = "nested";
export const derivedInputs: Array<DerivedInput> = ["nested"];
export const allVulcanInputs: Array<VulcanCoreInput | DerivedInput> = [
  ...standardInputs,
  ...advancedInputs,
  // derived inputs are specific to the Form internal computations
  // it can't be set by the user
  ...derivedInputs,
];

export const getAutoInputFromType = (
  fieldType: VulcanFieldType
): VulcanCoreInput => {
  const autoType =
    fieldType === Number //|| fieldType === SimpleSchema.Integer
      ? "number"
      : fieldType === Boolean
      ? "checkbox"
      : fieldType === Date
      ? "date"
      : "text";
  return autoType;
};
