"use client";
/**
 * Context that provides methods to access translated strings
 */
import React, { useContext, createContext } from "react";
import { StringsRegistry } from "./stringsRegistry";
import { Message } from "./typings";

type Formatter<T = any> = (val: T, ...args: any) => string;

interface IntlContextInput {
  localeId: string;
  stringsRegistry: StringsRegistry;
}
export interface IntlContextValue extends IntlContextInput {
  formatMessage: Formatter<Message>;
}

/**
 * Generate the format functions for a locale, that can be provided dynamically
 * @param
 * @returns
 */
const makeFormatMessage = ({
  stringsRegistry,
  localeId,
}: IntlContextInput): Formatter => {
  return function formatMessageForLocale(
    { id, defaultMessage }: Message,
    values = null
  ) {
    return stringsRegistry.getString({
      id,
      defaultMessage,
      values,
      localeId,
    });
  };
};

const makeContext = ({
  localeId,
  stringsRegistry,
}: IntlContextInput): IntlContextValue => ({
  localeId,
  stringsRegistry,
  formatMessage: makeFormatMessage({ localeId, stringsRegistry }),
});

export const IntlContext = createContext<IntlContextValue>(
  // default values: return tokens as is
  makeContext({
    localeId: "NOT_INITIALIZED",
    stringsRegistry: new StringsRegistry("NOT_INITIALIZED"),
  })
);

export interface IntlProviderProps extends IntlContextInput {
  children: React.ReactNode;
}
export const IntlContextProvider = ({
  localeId,
  stringsRegistry,
  ...props
}: IntlProviderProps) => {
  // merge parent strings if any (default registry is just empty)
  const currentContext = useIntlContext();
  console.log("currentContext", currentContext)
  stringsRegistry.mergeTokens(currentContext.stringsRegistry);

  const formatters = makeContext({ localeId, stringsRegistry });
  return <IntlContext.Provider value={formatters} {...props} />;
};

export const useIntlContext = () => useContext(IntlContext);
