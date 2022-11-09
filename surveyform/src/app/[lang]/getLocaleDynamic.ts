//import debug from "debug";
const debugRootLayout = console.debug; //debug("dgs:rootlayout");
import { headers } from "next/headers";
import {
  getLocaleFromAcceptLanguage,
  getLocaleFromCookie,
} from "~/i18n/server/localeDetection";
/**
 * Dynamic version to get the local for each request
 * Replaced by a middleware check currently
 */
const getCurrentLocale = () => {
  // TODO: this means using dynamic rendering
  // use segmented rendering instead
  // this seems to be what Next.js team plans for next release
  const hs = [...headers().entries()];
  debugRootLayout("Rendering RootLayout, got headers:", hs);
  const localeFromAcceptLanguage = getLocaleFromAcceptLanguage(
    headers().get("accept-language")
  );
  // TODO: use cookies() directly?
  const localeFromCookie = getLocaleFromCookie(headers().get("cookie"));
  const locale = localeFromAcceptLanguage || localeFromCookie;
  return locale;
};
