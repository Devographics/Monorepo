"use client";
import React, { useContext } from "react";
import { IntlContextProvider, StringsRegistry } from "@devographics/react-i18n";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import { LOCALE_COOKIE_NAME } from "../cookie";
import { localesDefsMap, defaultLocale } from "~/i18n/data/locales";
import { captureException } from "@sentry/nextjs";
import { LocaleDef, LocaleDefWithStrings } from "../typings";
import { useUser } from "~/account/user/hooks";

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

export const LocaleContext =
  React.createContext<LocaleContextValue>(dummyContext);

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
}) => {
  const { user } = useUser();
  const [cookies, setCookie, removeCookie] = useCookies();

  const { localeId, localeStrings, locales } = props;
  const localeDef = localesDefsMap[localeId] || defaultLocale; //useLocaleData({ currentUser, locale: localeFromProps });
  if (localeDef.id !== localeId) {
    captureException(
      `${localeId} doesn't exist, falling back to defaultLocale`
    );
  }

  const router = useRouter();
  /**
   * Switch to another locale, reload data accordingly
   */
  async function setLocale(localeId: string): Promise<void> {
    // TODO: see how it's implemented in incoming versions of Next 13+
    //if (!localeObject) throw new Error(`Locale not found for id ${localeId}`);
    const { updateUser } = props;
    removeCookie(LOCALE_COOKIE_NAME, { path: "/" });
    setCookie(LOCALE_COOKIE_NAME, localeId, { path: "/" });
    // if user is logged in, change their `locale` profile property
    if (user && updateUser) {
      try {
        await updateUser({
          selector: { documentId: user._id },
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
  }

  const { children } = props;

  const stringsRegistry = new StringsRegistry("en-US");
  stringsRegistry.addStrings(localeId, localeStrings.strings);
  return (
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
