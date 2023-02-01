/**
 * Field processing functions that computes groups and add relevant props for i18n
 */
import { formProperties } from "../../utils/schema_utils";
import { FieldGroup } from "@vulcanjs/schema";
import { FormField } from "../../typings";
import { FormProps, FormState } from "./typings";

/**
 * Field related functions
 */

import { VulcanSchema } from "@vulcanjs/schema";
import uniq from "lodash/uniq.js";
import compact from "lodash/compact.js";
import get from "lodash/get.js";
import pick from "lodash/pick.js";
import {
  isIntlField,
  formatLabel,
  getIntlKeys,
  getIntlLabel,
} from "@vulcanjs/i18n";

import { IntlProviderContextValue } from "@devographics/react-i18n";
import map from "lodash/map.js";
import sortBy from "lodash/sortBy.js";
import uniqBy from "lodash/uniqBy.js";
import difference from "lodash/difference.js";
import reject from "lodash/reject.js";
import intersection from "lodash/intersection.js";
import _filter from "lodash/filter.js";
import { capitalize } from "@vulcanjs/utils";
import { VulcanFieldSchema } from "@vulcanjs/schema";
import { VulcanModel } from "@vulcanjs/model";

/*

   Get a field's label

   */
export const getLabel = (
  model: VulcanModel,
  flatSchema: any,
  context: IntlProviderContextValue,
  fieldName: string,
  fieldLocale?: string
) => {
  const collectionName = model.name.toLowerCase();
  const label = formatLabel({
    intl: context,
    fieldName: fieldName,
    collectionName: collectionName,
    schema: flatSchema,
  });
  if (fieldLocale) {
    const intlFieldLocale = context.formatMessage({
      id: `locales.${fieldLocale}`,
      defaultMessage: fieldLocale,
    });
    return `${label} (${intlFieldLocale})`;
  } else {
    return label;
  }
};

/*

   Get a field's description

   (Same as getLabel but pass isDescription: true )
   */
const getDescription = (
  model: VulcanModel,
  flatSchema: any,
  context: any,
  fieldName: string
) => {
  const collectionName = model.name.toLowerCase();
  const description = getIntlLabel({
    intl: context,
    fieldName: fieldName,
    collectionName: collectionName,
    schema: flatSchema,
    isDescription: true,
  });
  return description || null;
};

/*

  Get a field option's label

  */
const getOptionLabel = (
  model: VulcanModel,
  context: { formatMessage: Function },
  fieldName: string,
  option: { intlId?: string; label: string; value?: any }
) => {
  const collectionName = model.name.toLowerCase();
  const intlId =
    option.intlId || `${collectionName}.${fieldName}.${option.value}`;
  return context.formatMessage({
    id: intlId,
    defaultMessage: option.label,
  });
};

/*

  Get a list of the fields to be included in the current form

  Note: when submitting the form (getData()), do not include any extra fields.

  */
export const getFieldNames = (
  props: Pick<FormProps, "fields" | "addFields" | "removeFields">,
  currentDocument,
  optionsFromArgs: {
    excludeHiddenFields?: boolean;
    excludeRemovedFields?: boolean;
    replaceIntlFields?: boolean;
    addExtraFields?: boolean;
    schema?: VulcanSchema;
    mutableFields?: Array<any>;
  }
) => {
  const { fields, addFields, removeFields } = props;
  const defaultOptions = {
    excludeHiddenFields: true,
    excludeRemovedFields: true,
    replaceIntlFields: false,
    addExtraFields: false,
  };
  const options = {
    ...defaultOptions,
    ...optionsFromArgs,
  };
  const {
    schema,
    mutableFields,
    excludeRemovedFields,
    excludeHiddenFields,
    addExtraFields,
    replaceIntlFields,
  } = options;

  // get all editable/insertable fields (depending on current form type)
  let relevantFields = mutableFields;

  // if "fields" prop is specified, restrict list of fields to it
  if (typeof fields !== "undefined" && fields.length > 0) {
    relevantFields = intersection(relevantFields, fields);
  }

  // if "hideFields" prop is specified, remove its fields
  if (excludeRemovedFields) {
    // OpenCRUD backwards compatibility
    //const removeFields = removeFields || hideFields;
    if (typeof removeFields !== "undefined" && removeFields.length > 0) {
      relevantFields = difference(relevantFields, removeFields);
    }
  }

  // if "addFields" prop is specified, add its fields
  if (
    addExtraFields &&
    typeof addFields !== "undefined" &&
    addFields.length > 0
  ) {
    relevantFields = relevantFields?.concat(addFields);
  }

  // remove all hidden fields
  if (excludeHiddenFields) {
    const document = currentDocument;
    relevantFields = reject(relevantFields, (fieldName) => {
      const hidden = schema?.[fieldName].hidden;
      return typeof hidden === "function"
        ? hidden({ props, document })
        : hidden;
    });
  }

  // replace intl fields
  if (replaceIntlFields) {
    relevantFields = relevantFields?.map((fieldName) =>
      isIntlField(schema?.[fieldName]) ? `${fieldName}_intl` : fieldName
    );
  }

  // remove any duplicates
  relevantFields = uniq(relevantFields);

  return relevantFields;
};

// --------------------------------------------------------------------- //
// -------------------------------- Fields ----------------------------- //
// --------------------------------------------------------------------- //

const initField = (
  props: { model: VulcanModel; layout?: "horizontal" | "vertical" },
  state: Pick<FormState, "currentDocument" | "flatSchema" | "originalSchema">,
  context: any,
  fieldName: string,
  fieldSchema: VulcanFieldSchema
) => {
  const { model } = props;
  const { currentDocument, flatSchema } = state;
  const isArray = fieldSchema.type === Array;

  // intialize properties
  let field: Partial<FormField> = {
    ...pick(fieldSchema, formProperties),
    name: fieldName,
    datatype: fieldSchema.type,
    layout: props.layout, // A layout property used to control how the form fields are displayed. Defaults to horizontal.
    input: fieldSchema.input || fieldSchema.control, // TODO
  };

  // if this is an array field also store its array item type
  if (isArray) {
    const itemFieldSchema = state.originalSchema[`${fieldName}.$`];
    field.itemDatatype = get(itemFieldSchema, "type.0.type");
  }

  field.label = getLabel(model, flatSchema, context, fieldName);
  field.intlKeys = getIntlKeys({
    fieldName,
    modelName: model.name,
    schema: model.schema,
  });
  // // replace value by prefilled value if value is empty
  // const prefill = fieldSchema.prefill || (fieldSchema.form && fieldSchema.form.prefill);
  // if (prefill) {
  //   const prefilledValue = typeof prefill === 'function' ? prefill.call(fieldSchema) : prefill;
  //   if (!!prefilledValue && !field.value) {
  //     field.prefilledValue = prefilledValue;
  //     field.value = prefilledValue;
  //   }
  // }

  const document = currentDocument;
  field.document = document;

  // internationalize field options labels
  if (field.options && Array.isArray(field.options)) {
    field.options = field.options.map((option) => ({
      ...option,
      label: getOptionLabel(model, context, fieldName, option),
    }));
  }

  // if this an intl'd field, use a special intlInput
  if (isIntlField(fieldSchema)) {
    field.intlInput = true;
  }

  // add any properties specified in fieldSchema.form as extra props passed on
  // to the form component, calling them if they are functions
  const inputProperties = fieldSchema.form || fieldSchema.inputProperties || {};
  for (const prop in inputProperties) {
    const property = inputProperties[prop];
    field[prop] =
      typeof property === "function"
        ? property.call(fieldSchema, {
          ...props,
          fieldName,
          document,
          intl: context,
        })
        : property;
  }

  // add description as help prop
  const description = getDescription(model, flatSchema, context, fieldName);
  if (description) {
    field.help = description;
  }

  return field as FormField;
};
const handleFieldPath = (
  field: FormField,
  fieldName: string,
  parentPath?: string
) => {
  const fieldPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
  field.path = fieldPath;
  // TODO: reintroduce this side effect to correctly set the default values
  // (previously was in Form.tsx)
  // Note sure if this is actually needed
  // if (field.defaultValue) {
  //   set(this.defaultValues, fieldPath, field.defaultValue);
  // }
  return field;
};
const handleFieldParent = (field: FormField, parentFieldName?: string) => {
  // if field has a parent field, pass it on
  if (parentFieldName) {
    field.parentFieldName = parentFieldName;
  }

  return field;
};
const handlePermissions = (
  field: FormField,
  fieldName: string,
  mutableFields: Array<any>
) => {
  // if field is not creatable/updatable, disable it
  if (!mutableFields.includes(fieldName)) {
    field.disabled = true;
  }
  return field;
};
const handleFieldChildren = (
  props: FormProps,
  state: Pick<FormState, "currentDocument" | "flatSchema" | "originalSchema">,
  context: any,
  field: FormField,
  fieldName: string,
  fieldSchema: any, // TODO: not a VulcanField, more a FormField
  schema: VulcanSchema,
  mutableFields: Array<any>
) => {
  const { currentDocument } = state;
  // array field
  if (fieldSchema.arrayFieldSchema) {
    field.arrayFieldSchema = fieldSchema.arrayFieldSchema;
    // create a field that can be exploited by the form
    field.arrayField = createArraySubField(
      props,
      state,
      context,
      fieldName,
      field.arrayFieldSchema,
      schema,
      mutableFields
    );
    //field.nestedInput = true
  }
  // nested fields: set input to "nested"
  if (fieldSchema.schema) {
    field.nestedSchema = fieldSchema.schema;
    field.nestedInput = true;

    // get nested schema
    // for each nested field, get field object by calling createField recursively
    field.nestedFields = getFieldNames(props, currentDocument, {
      schema: field.nestedSchema,
      addExtraFields: false,
    }).map((subFieldName) => {
      return createField(
        props,
        state,
        context,
        subFieldName,
        field.nestedSchema,
        mutableFields,
        fieldName,
        field.path
      );
    });
  }
  return field;
};

/*
  Given a field's name, the containing schema, and parent, create the
  complete field object to be passed to the component

  */
const createField = (
  props: FormProps,
  state: Pick<FormState, "currentDocument" | "flatSchema" | "originalSchema">,
  context: any,
  fieldName: string,
  schema: any,
  mutableFields: Array<any>,
  parentFieldName?: string,
  parentPath?: string
): FormField => {
  const fieldSchema = schema[fieldName];
  let field = initField(props, state, context, fieldName, fieldSchema);
  field = handleFieldPath(field, fieldName, parentPath);
  field = handleFieldParent(field, parentFieldName);
  field = handlePermissions(field, fieldName, mutableFields);
  field = handleFieldChildren(
    props,
    state,
    context,
    field,
    fieldName,
    fieldSchema,
    schema,
    mutableFields
  );
  return field;
};
const createArraySubField = (
  props: FormProps,
  state: Pick<FormState, "currentDocument" | "flatSchema" | "originalSchema">,
  context: any,
  fieldName: string,
  subFieldSchema: VulcanFieldSchema,
  schema: VulcanSchema,
  mutableFields: Array<string>
) => {
  const subFieldName = `${fieldName}.$`;
  let subField = initField(props, state, context, subFieldName, subFieldSchema);
  // array subfield has the same path and permissions as its parent
  // so we use parent name (fieldName) and not subfieldName
  subField = handleFieldPath(subField, fieldName);
  subField = handlePermissions(subField, fieldName, mutableFields /*schema*/);
  // we do not allow nesting yet
  //subField = this.handleFieldChildren(field, fieldSchema)
  return subField;
};

// Group of multiple fields (obtained by parsing the whole schema)
interface GroupWithFields extends FieldGroup {
  fields: Array<FormField>;
}

type FormSchemaState = Pick<
  FormState,
  "currentDocument" | "schema" | "flatSchema" | "originalSchema"
>;

/*

  Get all field groups

  */
export const getFieldGroups = (
  props: FormProps,
  state: FormSchemaState,
  context: IntlProviderContextValue,
  mutableFields: Array<string>,
  formatMessage: any
) => {
  const { schema, currentDocument } = state;
  // build fields array by iterating over the list of field names
  let fields = getFieldNames(props, currentDocument, {
    mutableFields,
    schema,
  }).map((fieldName) => {
    // get schema for the current field
    return createField(props, state, context, fieldName, schema, mutableFields);
  });

  fields = sortBy(fields, "order");

  // get list of all unique groups (based on their name) used in current fields, remove "empty" group
  let groups = compact(uniqBy(map(fields, "group"), (g) => (g ? g.name : "")));

  // for each group, add relevant fields
  let groupsWithFields = groups.map((group) => {
    const label =
      group.label ||
      //this.context.formatMessage({ id: group.name }) ||
      capitalize(group.name);
    const groupFields = _filter<FormField>(fields, (field) => {
      return field.group && field.group.name === group.name;
    });
    const groupWithFields: GroupWithFields = {
      ...group,
      label,
      fields: groupFields,
    };
    return groupWithFields;
  });

  // add default group if necessary
  const defaultGroupFields = _filter(fields, (field) => !field.group);
  if (defaultGroupFields.length) {
    const defaultGroup: GroupWithFields = {
      name: "default",
      label: "default",
      order: 0,
      fields: defaultGroupFields,
    };
    groupsWithFields = [defaultGroup].concat(groupsWithFields);
  }

  // sort by order
  groupsWithFields = sortBy(groupsWithFields, "order");

  // console.log(groups);

  return groupsWithFields;
};
