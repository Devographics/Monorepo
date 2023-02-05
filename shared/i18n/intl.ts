import { camelToSpaces } from "@vulcanjs/utils";
import SimpleSchema from "simpl-schema";
import {
  ValidationError,
  VulcanFieldSchema,
  VulcanSchema,
} from "@vulcanjs/schema";

// Locales
export const defaultLocale = "en";

export interface LocaleType {
  id: string;
  label?: string;
  required?: boolean;
  /** Locale must be fetched from the server (see LocaleContext) */
  dynamic?: boolean;
  /** Right-to-left (arabic, persian...) */
  rtl?: boolean;
  strings?: any;
  method?: any;
  /** If the id doesn't exist, we can try to fetch another local.
   * OriginalId is the initial requested id
   */
  originalId?: string;
}

// Mutable global object are deprecated => they don't work
// if you have multiple occurrences of the package and should be avoided

//

/*

Find best matching locale

en-US -> en-US
en-us -> en-US
en-gb -> en-US
etc.

*/
export const truncateKey = (key) => key.split("-")[0];

/**
 * Difference with Meteor: it's now a closure, to avoid having
 * a global "Locales" object, instead pass it from the app
 * @param Locales
 * @returns
 */
export const getValidLocale =
  (Locales: Array<LocaleType>) => (localeId: string) => {
    const exactLocale = Locales.find((locale: LocaleType) => {
      const { id } = locale;
      return id.toLowerCase() === localeId.toLowerCase();
    });
    if (exactLocale) return exactLocale;
    const countryLocale = Locales.find((locale: LocaleType) => {
      const { id } = locale;
      return truncateKey(id) === truncateKey(localeId);
    });
    if (countryLocale) return countryLocale;
    return null;
  };

// Helpers
/*

Look for type name in a few different places
Note: look into simplifying this

*/
export const isIntlField = (fieldSchema) => !!fieldSchema.intl;
/*

Look for type name in a few different places
Note: look into simplifying this

*/
export const isIntlDataField = (fieldSchema) => !!fieldSchema.isIntlData;

/*

Check if a schema already has a corresponding intl field

*/
export const schemaHasIntlField = (schema, fieldName) =>
  !!schema[`${fieldName}_intl`];

/*

Generate custom IntlString SimpleSchema type

*/
export const getIntlString = (): SimpleSchema & { name: string } => {
  const schema = {
    locale: {
      type: String,
      optional: true,
    },
    value: {
      type: String,
      optional: true,
    },
  };

  const IntlString = new SimpleSchema(schema);
  (IntlString as any).name = "IntlString";
  return IntlString as SimpleSchema & { name: string };
};

/*

Check if a schema has at least one intl field

*/
export const schemaHasIntlFields = (schema) =>
  Object.keys(schema).some((fieldName) => isIntlField(schema[fieldName]));

/** 

Custom validation function to check for required locales

See https://github.com/aldeed/simple-schema-js#custom-field-validation

Difference with Vulcan: it is now a closure
*/
export const validateIntlField = (Locales: Array<LocaleType>) =>
  function () {
    let errors: Array<ValidationError> = [];

    // go through locales to check which one are required
    const requiredLocales = Locales.filter((locale) => locale.required);

    requiredLocales.forEach((locale, index) => {
      const strings = this.value;
      const hasString =
        strings &&
        Array.isArray(strings) &&
        strings.some((s) => s && s.locale === locale.id && s.value);
      if (!hasString) {
        const originalFieldName = this.key.replace("_intl", "");
        errors.push({
          id: "errors.required",
          path: `${this.key}.${index}`,
          properties: { name: originalFieldName, locale: locale.id },
        });
      }
    });

    if (errors.length > 0) {
      // hack to work around the fact that custom validation function can only return a single string
      return `intlError|${JSON.stringify(errors)}`;
    }
  };

/**

Get an array of intl keys to try for a field

@example For model Foo of schema { foobar: { type: String, intlId: "foobar_translation"}} 
=> ["foobar_translation", "foo.foobar"]

*/
export const getIntlKeys = ({
  fieldName,
  modelName,
  schema,
}: {
  fieldName: string;
  modelName: string;
  schema: VulcanSchema;
}) => {
  const fieldSchema =
    schema && schema[fieldName] ? schema[fieldName] : ({} as VulcanFieldSchema);

  const { intlId } = fieldSchema;

  const intlKeys: Array<string> = [];
  if (intlId) {
    intlKeys.push(intlId);
  }
  if (modelName) {
    intlKeys.push(`${modelName.toLowerCase()}.${fieldName}`);
  }
  intlKeys.push(`global.${fieldName}`);
  intlKeys.push(fieldName);

  return intlKeys;
};

/**
 * getIntlLabel - Get a label for a field, for a given collection, in the current language.
 * The evaluation is as follows :
 * i18n(intlId) >
 * i18n(collectionName.fieldName) >
 * i18n(global.fieldName) >
 * i18n(fieldName)
 *
 * @param  {object} params
 * @param  {object} params.intl               An intlShape object obtained from the react context for example
 * @param  {string} params.fieldName          The name of the field to evaluate (required)
 * @param  {string} params.collectionName     The name of the collection the field belongs to
 * @param  {object} params.schema             The schema of the collection
 * @param  {object} values                    The values to pass to format the i18n string
 * @return {string}                           The translated label
 */
export const getIntlLabel = (
  {
    intl,
    fieldName,
    modelName,
    collectionName,
    schema,
    isDescription,
  }: {
    intl?: any;
    fieldName: string;
    schema: VulcanSchema;
    modelName?: string;
    /** @deprecated use modelName instead */
    collectionName?: string;
    isDescription?: boolean;
  },
  values?: any
) => {
  const fieldSchema = schema?.[fieldName]
    ? schema[fieldName]
    : ({} as VulcanFieldSchema);
  const { intlId } = fieldSchema;
  if (!fieldName) {
    throw new Error(
      "fieldName option passed to formatLabel cannot be empty or undefined"
    );
  }

  // if this is a description, just add .description at the end of the intl key
  const suffix = isDescription ? ".description" : "";

  const intlKeys: Array<string> = [];
  if (intlId) {
    intlKeys.push(intlId);
  }
  if (collectionName || modelName) {
    intlKeys.push(
      `${(
        collectionName ||
        modelName ||
        "unknown-model-name"
      ).toLowerCase()}.${fieldName}`
    );
  }
  intlKeys.push(`global.${fieldName}`);
  intlKeys.push(fieldName);

  let intlLabel;

  for (const intlKey of intlKeys) {
    const intlString = intl.formatMessage({ id: intlKey + suffix }, values);

    if (intlString !== "") {
      intlLabel = intlString;
      break;
    }
  }
  return intlLabel;
};

/*

Get intl label or fallback

*/
export const formatLabel = (
  options: {
    intl?: any;
    fieldName: string;
    schema: VulcanSchema;
    modelName?: string;
    /** @deprecated use modelName instead */
    collectionName?: string;
  },
  values?: any
) => {
  const { fieldName, schema } = options;
  const fieldSchema = schema?.[fieldName]
    ? schema[fieldName]
    : ({} as VulcanFieldSchema);
  const { label: schemaLabel } = fieldSchema;
  return (
    getIntlLabel(options, values) || schemaLabel || camelToSpaces(fieldName)
  );
};
