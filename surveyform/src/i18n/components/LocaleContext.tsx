"use client";
// TODO: this was copied from Vulcan NPM, put it back there when fixed
/**
 * In Vulcan Meteor, this is setup in packages/vulcan-core/lib/modules/components/App.jsx
 */
/*
import {
  runCallbacks,
  Routes,
} from "meteor/vulcan:lib";
*/
import React, { useContext, useEffect, useState } from "react";
import { IntlProvider } from "@vulcanjs/react-i18n";
import { IntlContext } from "./context";
// TODO: some of those HOC might be useful eg withLocaleData?
/*
import withUpdate from "../containers/update.js";
import withSiteData from "../containers/siteData.js";
import { withApollo } from "@apollo/client/react/hoc";
import moment from "moment";
*/
import merge from "lodash/merge.js";
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

interface LocaleState {
  id: string;
  rtl?: boolean;
  method?: any;
  loading?: boolean;
  strings?: any;
}
export const LocaleContextProvider = (props: {
  locales?: Array<LocaleDef>;
  locale: string;
  /** SSRed locale strings */
  localeStrings?: LocaleDef;

  currentUser?: any;
  /** Will optional let you */
  updateUser?: any;
  client?: any;
  children: React.ReactNode;
}) => {
  const [cookies, setCookie, removeCookie] = useCookies();
  const {
    currentUser,
    locale: localeFromProps,
    localeStrings: localeStringsFromProps,
  } = props;
  const locale = localesDefsMap[localeFromProps] || defaultLocale; //useLocaleData({ currentUser, locale: localeFromProps });
  if (locale.id !== localeFromProps) {
    captureException(
      `${localeFromProps} doesn't exist, falling back to defaultLocale`
    );
  }
  // get translation strings loaded dynamically
  // Use the server version in priority
  const loadedStrings = localeStringsFromProps; //  || locale?.data?.locale?.strings;
  // get translation strings bundled statically
  // @ts-ignore
  const [state, setState] = useState<{
    locale: LocaleState;
    localeStrings?: any;
  }>({
    locale: {
      // @ts-ignore
      id: locale.id,
      // @ts-ignore
      rtl: locale.rtl ?? false,
      // @ts-ignore
      method: locale.method,
      loading: false,
      strings: merge({}, loadedStrings),
    },
  });

  // Update state when we finish loading the locale
  useEffect(() => {
    if (!locale.loading) {
      setState((currentState) => ({
        ...currentState,
        locale: {
          // @ts-ignore
          id: locale.id,
          // @ts-ignore
          rtl: locale.rtl ?? false,
          // @ts-ignore
          method: locale.method,
          loading: false,
          strings: merge({}, loadedStrings),
        },
      }));
    }
  }, [locale.loading, locale.id]);

  /**
   * Get the current locale id
   */
  const getLocaleId = () => {
    return state.locale.id;
  };

  const getLocaleDefs = () => {
    return props.locales || [];
  };

  const getLocale = () => {
    return localesDefsMap[getLocaleId()];
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
      await updateUser({
        selector: { documentId: currentUser._id },
        data: { locale: localeId },
      });
    }
    // TODO: it should be enough to update lang with the new cookie,
    // but we need to double-check
    router.refresh();
    // TODO: how to handle moment
    // moment.locale(localeId);
    /*
    TODO: not sure how it was used
    if (hasIntlFields) {
      client.resetStore();
    }*/
  };

  const { children } = props;
  const localeId = state.locale.id;
  //const LayoutComponent = currentRoute.layoutName ? Components[currentRoute.layoutName] : Components.Layout;

  const intlObject = {
    locale: localeId,
    key: localeId,
    messages: state.locale.strings,
  };

  // TODO: optimize with SSR
  // if (locale.loading) return <Components.Loading />;
  // keep IntlProvider for now for backwards compatibility with legacy Context API
  const stringsRegistry = makeStringsRegistry();
  stringsRegistry.addStrings(localeId, state.localeStrings);

  return (
    <IntlProvider stringsRegistry={stringsRegistry} {...intlObject}>
      <IntlContext.Provider value={intlObject}>
        <LocaleContext.Provider value={{ getLocale, setLocale, getLocaleDefs }}>
          <div className={`locale-${localeId}`}>{children}</div>
        </LocaleContext.Provider>
      </IntlContext.Provider>
    </IntlProvider>
  );
};

export const useLocaleContext = () => useContext(LocaleContext);
