"use client";
/**
 * Legacy code from Vulcan, simplify if possible
 */
import React, { useContext } from "react";
import { IntlProvider } from "@vulcanjs/react-i18n";
import { IntlContext } from "./context";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { LOCALE_COOKIE_NAME } from "../cookie";
import { localesDefsMap, defaultLocale } from "~/i18n/data/locales";
import { captureException } from "@sentry/nextjs";
import { LocaleDef } from "../typings";

interface LocaleContextType {
  setLocale: any;
  getLocale: any;
  getLocaleDefs: () => Array<LocaleDef>;
}

export const LocaleContext = React.createContext<LocaleContextType>({
  setLocale: () => {
    throw new Error("Calling setLocale but LocaleContext not set");
  },
  getLocale: () => {
    throw new Error("Calling getLocale but LocaleContext not set");
  },
  getLocaleDefs: () => {
    throw new Error("Calling getLocaleDefs but LocaleContext not set");
  },
});

/**
 * Registry of strings for all locales
 * TODO: taken from Vulcan i18n package,
 * needed by FormattedMessage
 * @returns
 */
export const makeStringsRegistry = () => {
  const Strings = {};
  const addStrings = (language, strings) => {
    if (typeof Strings[language] === "undefined") {
      Strings[language] = {};
    }
    Strings[language] = {
      ...Strings[language],
      ...strings,
    };
  };

  const getString = ({ id, values, defaultMessage, messages, locale }: any) => {
    let message = "";

    if (messages && messages[id]) {
      // first, look in messages object passed through arguments
      // note: if defined, messages should also contain Strings[locale]
      message = messages[id];
    } else if (Strings[locale] && Strings[locale][id]) {
      message = Strings[locale][id];
    } else if (Strings[defaultLocale] && Strings[defaultLocale][id]) {
      // debug(`\x1b[32m>> INTL: No string found for id "${id}" in locale "${locale}", using defaultLocale "${defaultLocale}".\x1b[0m`);
      message = Strings[defaultLocale] && Strings[defaultLocale][id];
    } else if (defaultMessage) {
      // debug(`\x1b[32m>> INTL: No string found for id "${id}" in locale "${locale}", using default message "${defaultMessage}".\x1b[0m`);
      message = defaultMessage;
    }

    if (values && typeof values === "object") {
      Object.keys(values).forEach((key) => {
        // note: see replaceAll definition in vulcan:lib/utils
        message = (message as any).replaceAll(`{${key}}`, values[key]); // TODO: false positive on replaceAll not existing in TS
      });
    }
    return message;
  };

  const getStrings = (localeId) => {
    return Strings[localeId];
  };
  return { Strings, addStrings, getString, getStrings };
};
export type StringsRegistry = ReturnType<typeof makeStringsRegistry>;

export const LocaleContextProvider = (props: {
  locales?: Array<LocaleDef>;
  localeId: string;
  /** SSRed locale strings */
  localeStrings: LocaleDef;
  currentUser?: any;
  /** Will optional let you */
  updateUser?: any;
  client?: any;
  children: React.ReactNode;
}) => {
  const [cookies, setCookie, removeCookie] = useCookies();
  const { localeId, localeStrings: localeStringsFromProps } = props;
  const localeDef = localesDefsMap[localeId] || defaultLocale; //useLocaleData({ currentUser, locale: localeFromProps });
  if (localeDef.id !== localeId) {
    captureException(
      `${localeId} doesn't exist, falling back to defaultLocale`
    );
  }
  // get translation strings loaded dynamically
  // Use the server version in priority
  const loadedStrings = localeStringsFromProps; //  || locale?.data?.locale?.strings;

  const getLocaleDefs = () => {
    return props.locales || [];
  };

  const getLocale = () => {
    return localeDef;
  };

  const router = useRouter();
  /**
   * Switch to another locale, reload data accordingly
   */
  const setLocale = async (localeId: string) => {
    // TODO: see how it's implemented in incoming versions of Next 13+
    //if (!localeObject) throw new Error(`Locale not found for id ${localeId}`);
    const { updateUser, /*client,*/ currentUser } = props;
    removeCookie(LOCALE_COOKIE_NAME, { path: "/" });
    setCookie(LOCALE_COOKIE_NAME, localeId, { path: "/" });
    // if user is logged in, change their `locale` profile property
    if (currentUser && updateUser) {
      try {
        await updateUser({
          selector: { documentId: currentUser._id },
          data: { locale: localeId },
        });
      } catch (err) {
        console.error("Could not update user language");
        captureException(err);
      }
    }
    // TODO: it should be enough to update lang with the new cookie,
    // but we need to double-check
    router.refresh();
  };

  const { children } = props;
  //const LayoutComponent = currentRoute.layoutName ? Components[currentRoute.layoutName] : Components.Layout;

  const intlObject = {
    locale: localeId,
    key: localeId,
    messages: loadedStrings,
  };

  // TODO: optimize with SSR
  // if (locale.loading) return <Components.Loading />;
  // keep IntlProvider for now for backwards compatibility with legacy Context API
  const stringsRegistry = makeStringsRegistry();
  stringsRegistry.addStrings(localeId, loadedStrings.strings);
  //console.log("str", { stringsRegistry, localeId });

  return (
    <IntlProvider
      stringsRegistry={stringsRegistry}
      messages={intlObject.messages}
      locale={intlObject.locale}
    >
      <IntlContext.Provider value={intlObject}>
        <LocaleContext.Provider value={{ getLocale, setLocale, getLocaleDefs }}>
          <div className={`locale-${localeId}`}>{children}</div>
        </LocaleContext.Provider>
      </IntlContext.Provider>
    </IntlProvider>
  );
};

export const useLocaleContext = () => useContext(LocaleContext);
