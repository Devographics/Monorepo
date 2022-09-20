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
import { getLocale as getRegisteredLocale, stringsRegistry } from "~/i18n";
// TODO: some of those HOC might be useful eg withLocaleData?
/*
import withCurrentUser from "../containers/currentUser.js";
import withUpdate from "../containers/update.js";
import withSiteData from "../containers/siteData.js";
import withLocaleData from "../containers/localeData.js";
import { withApollo } from "@apollo/client/react/hoc";
import moment from "moment";
import { Switch, Route } from "react-router-dom";
import { withRouter } from "react-router";
*/
import get from "lodash/get.js";
import merge from "lodash/merge.js";
import { useLocaleData } from "../hooks/useLocaleData";

// see https://stackoverflow.com/questions/42862028/react-router-v4-with-multiple-layouts
interface LocaleContextType {
  setLocale: any;
  getLocale: any;
}

export const LocaleContext = React.createContext<LocaleContextType>({
  setLocale: () => {
    throw new Error("Calling setLocale but LocaleContext not set");
  },
  getLocale: () => {
    throw new Error("Calling getLocale but LocaleContext not set");
  },
});

interface LocaleState {
  id: string;
  rtl?: boolean;
  method?: any;
  loading?: boolean;
  strings?: any;
}
import { useCookies } from "react-cookie";
import { LOCALE_COOKIE_NAME } from "../cookie";
import { useRouter } from "next/router";
export const LocaleContextProvider = (props: {
  /** Can force a locale */
  locale?: string;
  /** SSRed locale strings */
  localeStrings?: any;

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
  const locale = useLocaleData({ currentUser, locale: localeFromProps });
  // get translation strings loaded dynamically
  // Use the server version in priority
  const loadedStrings = localeStringsFromProps || locale?.data?.locale?.strings;
  // get translation strings bundled statically
  // @ts-ignore
  const bundledStrings = stringsRegistry.Strings[locale.id];
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
      strings: merge({}, loadedStrings, bundledStrings),
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
          strings: merge({}, loadedStrings, bundledStrings),
        },
      }));
    }
  }, [locale.loading, locale.id]);

  /*

  Load a locale by triggering the refetch() method passed down by
  withLocalData HoC

  */
  const loadLocaleStrings = async (localeId) => {
    if (!locale?.refetch) throw new Error("Can't refetch");
    const result = await locale.refetch({ localeId });
    const fetchedLocaleStrings = get(result, "data.locale.strings", []);
    const localeStrings = merge({}, state.localeStrings, fetchedLocaleStrings);
    return localeStrings;
  };

  /**
   * Get the current locale id
   */
  const getLocale = () => {
    return state.locale.id;
  };

  const router = useRouter();
  /**
   * Switch to another locale, reload data accordingly
   */
  const setLocale = async (localeId: string) => {
    // note: this is the getLocale in intl.js, not this.getLocale()!
    const localeObject = getRegisteredLocale(localeId);
    if (!localeObject) throw new Error(`Locale not found for id ${localeId}`);
    const { updateUser, /*client,*/ currentUser } = props;
    let localeStrings;

    /**
     * TODO: probably not really needed anymore
     * this will update the locale client-side, but now
     * the strings are server always by the server
     *
     * This might only be useful if the translation API is down?
     * But the code could still be simplified
     */
    // if this is a dynamic locale, fetch its data from the server
    // provided top level in _app should have the priority over the strings
    // loaded dynamically
    // We shouldn't need this step in the first place
    if (localeObject.dynamic) {
      setState((currentState) => ({
        ...currentState,
        locale: {
          ...currentState.locale,
          ...localeObject,
          loading: true,
          rtl: localeObject?.rtl ?? false,
        },
      }));
      localeStrings = await loadLocaleStrings(localeId);
    } else {
      // TODO: not used anymore, all locales are dynamic currently
      localeStrings = stringsRegistry.getStrings(localeId);
    }

    /*
    // OLD CODE: change the locale client-side, but now we use redirections
    and server-side data fetching

    // before removing the loading we have to change the rtl class on HTML tag if it exists
    if (
      document &&
      typeof document.getElementsByTagName === "function" &&
      document.getElementsByTagName("html")
    ) {
      const htmlTag = document.getElementsByTagName("html");
      if (htmlTag && htmlTag.length === 1) {
        // change in locale didn't change the html lang as well, which is fixed by this PR
        htmlTag[0].lang = localeId;
        if (localeObject?.rtl === true) {
          htmlTag[0].classList.add("rtl");
        } else {
          htmlTag[0].classList.remove("rtl");
        }
      }
    }
    setState((currentState) => ({
      ...currentState,
      locale: {
        ...currentState.locale,
        loading: false,
        id: localeId,
        rtl: localeObject?.rtl ?? false,
        strings: localeStrings,
      },
    }));
    */

    removeCookie(LOCALE_COOKIE_NAME, { path: "/" });
    setCookie(LOCALE_COOKIE_NAME, localeId, { path: "/" });
    // if user is logged in, change their `locale` profile property
    if (currentUser && updateUser) {
      await updateUser({
        selector: { documentId: currentUser._id },
        data: { locale: localeId },
      });
    }
    // Redirect to exact same page but new locale
    const { pathname, asPath, query } = router;
    // change just the locale and maintain all other route information including href's query
    router.push({ pathname, query }, asPath, { locale: localeId });

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
  return (
    <IntlProvider stringsRegistry={stringsRegistry} {...intlObject}>
      <IntlContext.Provider value={intlObject}>
        <LocaleContext.Provider value={{ getLocale, setLocale }}>
          <div className={`locale-${localeId}`}>{children}</div>
        </LocaleContext.Provider>
      </IntlContext.Provider>
    </IntlProvider>
  );
};

export const useLocaleContext = () => useContext(LocaleContext);

/*
App.propTypes = {
  currentUserLoading: PropTypes.bool,
};

App.childContextTypes = {
  intl: intlShape,
  setLocale: PropTypes.func,
  getLocale: PropTypes.func,
};
*/

/*
App.displayName = "App";

const updateOptions = {
  collectionName: "Users",
  fragmentName: "UsersCurrent",
};

registerComponent(
  "App",
  App,
  withCurrentUser,
  withLocaleData,
  [withUpdate, updateOptions],
  withApollo,
  withCookies,
);
*/
