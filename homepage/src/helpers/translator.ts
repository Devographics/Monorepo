import template from "lodash/template.js";
import clone from "lodash/clone";

interface Translation {
  key: string;
  t: string;
}

export interface Locale {
  id?: string;
  label?: string;
  strings?: Translation[];
}

export interface i18nContextType {
  locale: Locale;
  locales: Locale[];
  getString: StringTranslator;
}

interface InterpolationValues {
  values?: { [key: string]: string };
}

export interface StringTranslator {
  (
    key: string,
    interpolation?: InterpolationValues,
    fallback?: string,
  ): StringTranslatorResult;
}

interface StringTranslatorResult {
  locale: Omit<Locale, "strings">;
  missing?: boolean;
  key?: string;
  t?: string;
  tHtml?: string;
  fallback?: string;
}

/*

Returns the translation string object

*/
const findString = (key: string, strings: Translation[]) => {
  // reverse strings so that strings added last take priority
  return strings
    .slice()
    .reverse()
    .find((t) => t.key === key);
};

export const applyTemplate = (
  t: string,
  values: { [key: string]: string },
  locale: Locale,
  key: string,
) => {
  try {
    return template(t, { interpolate: /{([\s\S]+?)}/g })(values);
  } catch (error) {
    console.error(`[${locale.id}][ERR] ${key}`);
    console.error(error);
    return `[${locale.id}][ERR] ${key}`;
  }
};

export const getStringTranslator =
  (locale: Locale = {}): StringTranslator =>
  (key, { values } = {}, fallback) => {
    const { strings = [], ...rest } = locale;
    let result: StringTranslatorResult = { key, locale: rest };

    const stringObject = findString(key, strings);

    if (stringObject) {
      result = { ...result, ...stringObject };
    } else {
      result.missing = true;
      if (fallback) {
        result.t = fallback;
      }
    }

    if (result.t) {
      result.t = values
        ? applyTemplate(result.t, values, locale, key)
        : result.t;
      result.tHtml = values
        ? applyTemplate(result.tHtml, values, locale, key)
        : result.tHtml;
    }

    return result;
  };

export const getLocaleSubset = (locale: Locale, keys: string[]) => {
  const strings = locale.strings.filter((s) => keys.includes(s.key));
  return { ...locale, strings };
};
