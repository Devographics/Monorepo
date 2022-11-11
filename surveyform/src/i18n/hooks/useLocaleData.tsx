// TODO: this is a quick migration for state of js
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { initLocale, LocaleType } from "@vulcanjs/i18n";
/*
import { useCurrentUser } from "./currentUser";
*/
import { useCookies } from "react-cookie";
import { Locales } from "~/i18n";
import { LOCALE_COOKIE_NAME } from "../cookie";

/** 

Query to load strings for a specific locale from the server

NOTE: this is run against the Next.js server, which in
turns can call the translationAPI to get the current locales

During SSR, you should directly use the getLocaleFromRegistries helper
to avoid

*/
export const localeDataQuery = gql`
  query LocaleData($localeId: String) {
    locale(localeId: $localeId) {
      id
      strings
    }
  }
`;

/**
Get the string for a given locale
*/
export const useLocaleData = (props: { currentUser?: any; locale?: any }) => {
  const { currentUser } = props;
  const [cookies] = useCookies([LOCALE_COOKIE_NAME]);
  const init = initLocale(Locales)({
    currentUser,
    // from cookies
    cookies: { locale: cookies[LOCALE_COOKIE_NAME] },
    // will be used in priority
    locale: props.locale,
  });
  console.debug(
    "useLocaleData",
    {
      fromProps: props.locale,
      fromCurrentUser: currentUser,
      fromCookie: cookies[LOCALE_COOKIE_NAME],
    },
    "selected:",
    init.id
  );
  const queryResult = useQuery<{ locale: LocaleType }>(localeDataQuery, {
    variables: { localeId: init.id },
  });
  return { ...queryResult, ...init };
};
