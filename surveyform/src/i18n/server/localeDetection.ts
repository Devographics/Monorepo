/**
 * Various helpers for i18n
 *
 * NOTE: not used anymore if we use Next redirections
 * TODO This code should be moved in a reusable package of Vulcan Next
 * in "packages" folder
 */
import { IncomingMessage } from "http";
import { NextPageContext } from "next";
import { LOCALE_COOKIE_NAME } from "../cookie";

// Add language info to the custom _document header
export interface DocumentLanguageProps {
  languageDirection: string; // right to left (arabic etc.) or left to right (latin languages etc.)
  language: string;
}
interface HtmlLanguageProps {
  dir: string;
  lang: string;
}

// i18next-http-middleware is in charge of enhancing the req object
// interface IncomingMessageWithI18n extends IncomingMessage {
//   language?: string;
//   i18n: any;
// }

const rtlLocales: Array<string> = [
  /** Add locales of languages that reads right-to-left, depending on your own needs (persian, arabic, etc.)*/
];

export const i18nPropsFromCtx = (
  ctx: NextPageContext
): Partial<HtmlLanguageProps> => {
  // our own i18n system based on cookie
  if (ctx.req) {
    const locale = getLocaleFromReq(ctx.req);
    if (locale) {
      const lang = locale.slice(0, 2);
      return {
        lang: lang,
        dir: rtlLocales.includes(lang) ? "rtl" : "ltr",
      };
    }
  }
  // Else fallback to next/next-i18n default behaviour
  // At the time of writing (2021, Next 12) Next.js automatically handles the "lang" attribute
  const locale = ctx.locale;
  if (!locale) return {};
  let dir = "ltr";
  if (rtlLocales.includes(locale)) {
    dir = "rtl";
  }

  // "dir" (the language direction) may need more investigation
  return {
    dir,
    //dir: req.i18n && req.i18n.dir(req.language),
  };
};

/**
 * TO be used in API routes for instance
 * @param req
 * @returns
 */
export const getReqAcceptLanguage = (req: IncomingMessage) => {
  return req?.headers?.["accept-language"];
};
export const getLocaleFromAcceptLanguage = (acceptLanguage?: string | null) => {
  if (!acceptLanguage) return undefined;
  // Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7
  // Or fr,en_US;q=0.8
  // This header has a weird syntax if we want a full parser
  // here we keep only the first value
  const locale = acceptLanguage.split(",")[0]; //.slice(0, 5);
  return locale;
};

export const getReqCookies = (req: IncomingMessage) => {
  return req?.headers?.cookie;
};
/**
 * @deprecated We can get cookie directly in middleware or server component,
 * no need to parse the header
 * @param cookieHeader
 * @returns
 */
export const getLocaleFromCookie = (cookieHeader?: string | null) => {
  if (!cookieHeader) return undefined;
  // foo=1;bar=hello
  const cookies = cookieHeader.split(";").map((c) => c.trim().split("="));
  const localeCookie = cookies.find(([cookieName, cookieValue]) => {
    return cookieName === LOCALE_COOKIE_NAME;
  });
  if (!localeCookie?.length) {
    // Try to get from accept-language
    return undefined;
  }
  const localeValue = localeCookie[1];
  return localeValue;
};
/**
 * 1. Get from cookie
 * 2. Get from Accept-Language
 *
 * Locale can have region or not: fr or fr-FR etc.
 *
 * TODO: we could also get the locale from the database
 * via the "user.locale" preference field
 * Not yet setup, this means an asynchronous call
 *
 * Next doesn't provide the locale in API requests
 * So we need custom logic
 * @see https://github.com/vercel/next.js/discussions/21798
 *
 * @param req
 * @returns
 */
export const getLocaleFromReq = (req: IncomingMessage) => {
  const fromCookie = getLocaleFromCookie(getReqAcceptLanguage(req));
  if (fromCookie) return fromCookie;
  const fromAcceptLanguage = getLocaleFromAcceptLanguage(getReqCookies(req));
  if (fromAcceptLanguage) return fromAcceptLanguage;
  return undefined;
};
