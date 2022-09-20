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

export const getLocaleFromAcceptLanguage = (req: IncomingMessage) => {
  const acceptLanguage = req?.headers?.["accept-language"];
  if (!acceptLanguage) return undefined;
  // Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7
  const locale = acceptLanguage.slice(0, 5);
  return locale;
};

export const getLocaleFromCookie = (req: IncomingMessage) => {
  // Try to get from cookies
  if (!req?.headers?.cookie) {
    // Try to get from accept language
    return undefined;
  }
  const cookieHeader = req.headers.cookie;
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
 * 2. get from Accept-Language
 *
 * TODO: we could also get the locale from the database
 * via the "user.locale" preference field
 * Not yet setup, this means an asynchronous call
 * @param req
 * @returns
 */
export const getLocaleFromReq = (req: IncomingMessage) => {
  const fromCookie = getLocaleFromCookie(req);
  if (fromCookie) return fromCookie;
  const fromAcceptLanguage = getLocaleFromAcceptLanguage(req);
  if (fromAcceptLanguage) return fromAcceptLanguage;
  return undefined;
};
