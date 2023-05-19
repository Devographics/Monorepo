"use client";
import React, { createContext, useContext } from "react";
import { IntlContextProvider, StringsRegistry } from "@devographics/react-i18n";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { LOCALE_COOKIE_NAME } from "../cookie";
import { localesDefsMap, defaultLocale } from "~/i18n/data/locales";
import { captureException } from "@sentry/nextjs";
import { LocaleDef, LocaleDefWithStrings } from "../typings";
import { useCurrentUser } from "~/lib/users/hooks";

interface LocaleContextValue {
  setLocale: (localId: string) => Promise<void>;
  locale: LocaleDef;
  locales: Array<LocaleDef>;
  localeId: string;
}
const dummyContext: LocaleContextValue = {
  locale: { id: "NOT_SET" },
  localeId: "NOT_SET",
  locales: [],
  setLocale: () => {
    throw new Error("Locale context not set");
  },
};

export const LocaleContext = createContext<LocaleContextValue>(dummyContext);

export const useSetLocale = (updateUser?: any) => {
  const { currentUser } = useCurrentUser();
  const [cookies, setCookie, removeCookie] = useCookies();
  const router = useRouter();
  /**
   * Switch to another locale, reload data accordingly
   */
  async function setLocale(newLocaleId: string): Promise<void> {
    // TODO: see how it's implemented in incoming versions of Next 13+
    //if (!localeObject) throw new Error(`Locale not found for id ${localeId}`);
    removeCookie(LOCALE_COOKIE_NAME, { path: "/" });
    setCookie(LOCALE_COOKIE_NAME, newLocaleId, { path: "/" });
    // if user is logged in, change their `locale` profile property
    if (currentUser && updateUser) {
      try {
        await updateUser({
          selector: { documentId: currentUser._id },
          data: { locale: newLocaleId },
        });
      } catch (err) {
        console.error("Could not update user language");
        captureException(err);
      }
    }
    // the middleware will rerun and redirect user to right locale
    // TODO: it doesn't change the visible URL in the browser despite using the right locale and running the middleware
    router.refresh();
  }
  return setLocale;
};
/**
 * Provide methods to get/set the current locale
 * + initialize an IntlProvider
 * @param props
 * @returns
 */
export const LocaleContextProvider = (props: {
  localeId: string;
  localeStrings: LocaleDefWithStrings;
  locales: Array<LocaleDef>;
  /** Optionally store the selected locale */
  updateUser?: any;
  children: React.ReactNode;
  /** Context to add to the default ones */
  contexts?: Array<string>;
}) => {
  const setLocale = useSetLocale(props.updateUser);
  const { localeId, localeStrings, locales } = props;
  const localeDef = localesDefsMap[localeId] || defaultLocale;
  if (localeDef.id !== localeId) {
    captureException(
      `${localeId} doesn't exist, falling back to defaultLocale`
    );
  }

  const { children } = props;

  const stringsRegistry = new StringsRegistry("en-US");
  stringsRegistry.addStrings(localeId, localeStrings.strings);
  return (
    // NOTE: IntlContextProvider is in charge of merging strings with a previously existing parent
    <IntlContextProvider stringsRegistry={stringsRegistry} localeId={localeId}>
      <LocaleContext.Provider
        value={{
          locales,
          locale: localeDef,
          localeId,
          setLocale,
        }}
      >
        <div className={`locale-${localeId}`}>{children}</div>
      </LocaleContext.Provider>
    </IntlContextProvider>
  );
};

/**
 * Get locale get/set methods
 * + available locales
 *
 * Use useIntlContext to format a message
 */
export const useLocaleContext = (): LocaleContextValue => {
  return useContext(LocaleContext);
};
