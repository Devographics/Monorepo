import { deprecate } from "@vulcanjs/utils";
import React, { Component, useContext } from "react";
import type { StringsRegistry } from "@vulcanjs/i18n";
// TODO: do we still need the shape?
import { intlShape } from "./shape";
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
  formatMessage: makeFormatMessage({ locale, messages, stringsRegistry }),
  formatHTMLMessage: formatAny,
  now: null, // ?
  locale: locale,
});

export const IntlProviderContext =
  React.createContext<IntlProviderContextValue>(
    makeDefaultValue({
      locale: "",
      messages: [],
      stringsRegistry: {
        Strings: [],
        getStrings: () => {},
        getString: ({ id, values, defaultMessage }) => {
          // TODO: here we use Vulcan custom i18n system to display translations, eg for form submit
          // we should get rid of that somehow?
          console.warn(
            "intl-provider-context not setup with a string registry"
          );
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
  return (
    <IntlProviderContext.Provider
      value={makeDefaultValue({ locale, messages, stringsRegistry })}
      {...props}
    />
  );
};

export const useIntlContext = () => useContext(IntlProviderContext);

/**
 * Use for class components that still rely on the old API
 *
 * This is only necessary when you have a component that rely on multiple contexts
 * and that you cannot move to a stateless component.
 * If you can use a stateless component instead, prefer using useIntlcontext hook
 * If you are stuck with a stateful component, use static contextType = IntlProviderContext
 * If you have multiple context, then you'll need this legacy provider until you can move to hooks
 */
export class LegacyIntlProvider extends Component<IntlProviderProps> {
  static childContextTypes = {
    intl: intlShape,
  };
  formatMessage = ({ id, defaultMessage }, values = null) => {
    const { messages, locale, stringsRegistry } = this.props;
    return stringsRegistry.getString({
      id,
      defaultMessage,
      values,
      messages,
      locale,
    });
  };

  formatStuff = (something) => {
    return something;
  };

  getChildContext() {
    return {
      intl: {
        formatDate: this.formatStuff,
        formatTime: this.formatStuff,
        formatRelative: this.formatStuff,
        formatNumber: this.formatStuff,
        formatPlural: this.formatStuff,
        formatMessage: this.formatMessage,
        formatHTMLMessage: this.formatStuff,
        now: this.formatStuff,
        locale: this.props.locale,
      },
    };
  }

  render() {
    deprecate(
      "0.0.0",
      "Please React's new context API in your class components: static contextType = IntlProviderContext;, or move to hooks"
    );
    return this.props.children;
  }
}

export default IntlProvider;
