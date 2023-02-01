"use client";
/**
 * Context that provides methods to access translated strings
 */
import React, { useContext, createContext } from "react";

// Structure to store the strings
interface StringsRegistry {
  Strings: {};
  addStrings: (language: any, strings: any) => void;
  getString: ({ id, values, defaultMessage, messages, locale }: any) => string;
  getStrings: (localeId: any) => any;
}

// TODO: do we still need the shape?
import { Message } from "./typings";

type Formatter<T = any> = (val: T, ...args: any) => string;

interface IntlProps {
  // name of the locale
  locale: string;
  // strings
  messages: any;
  stringsRegistry: StringsRegistry;
}

/**
 * Generate the format functions for a locale, that can be provided dynamically
 * @param
 * @returns
 */
const makeFormatMessage = ({
  stringsRegistry,
  locale,
  messages,
}: IntlProps) => {
  return function formatMessageForLocale(
    { id, defaultMessage },
    values = null
  ) {
    return stringsRegistry.getString({
      id,
      defaultMessage,
      values,
      messages,
      locale,
    });
  };
};

const formatAny = (something: any): string => {
  return "" + something;
};

export interface IntlProviderContextValue {
  formatDate: Formatter;
  formatTime: Formatter;
  formatRelative: Formatter;
  formatNumber: Formatter;
  formatPlural: Formatter;
  formatMessage: Formatter<Message>;
  formatHTMLMessage: Formatter;
  now: any;
  locale: string;
}

/**
 * Methods to access the locale
 * @param param0
 * @returns
 */
const makeDefaultValue = ({
  locale,
  messages,
  stringsRegistry,
}: IntlProps): IntlProviderContextValue => ({
  formatDate: formatAny,
  formatTime: formatAny,
  formatRelative: formatAny,
  formatNumber: formatAny,
  formatPlural: formatAny,
  // @ts-ignore
  formatMessage: makeFormatMessage({ locale, messages, stringsRegistry }),
  formatHTMLMessage: formatAny,
  now: null, // ?
  locale: locale,
});

export const IntlProviderContext = createContext<IntlProviderContextValue>(
  makeDefaultValue({
    locale: "",
    messages: [],
    stringsRegistry: {
      Strings: [],
      getStrings: () => {},
      getString: ({ id, values, defaultMessage }) => {
        // TODO: here we use Vulcan custom i18n system to display translations, eg for form submit
        // we should get rid of that somehow?
        console.warn("intl-provider-context not setup with a string registry");
        return defaultMessage;
      },
      addStrings: () => {},
    },
  })
);

export interface IntlProviderProps extends IntlProps {
  children: React.ReactNode;
  messages: any;
}
export const IntlProvider = ({
  locale,
  messages,
  stringsRegistry,
  ...props
}: IntlProviderProps) => {
  // TODO: try to merge tokens with a preexisting parent IntlProvider
  const currentContext = useIntlContext();
  console.log("current i18n locale", currentContext.locale);
  return (
    <IntlProviderContext.Provider
      value={makeDefaultValue({ locale, messages, stringsRegistry })}
      {...props}
    />
  );
};

export const useIntlContext = () => useContext(IntlProviderContext);
