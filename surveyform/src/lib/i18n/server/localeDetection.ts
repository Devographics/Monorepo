/**
 * Various helpers for i18n
 *
 * NOTE: not used anymore if we use Next redirections
 * TODO This code should be moved in a reusable package of Vulcan Next
 * in "packages" folder
 */
import { IncomingMessage } from "http";

// Add language info to the custom _document header
export interface DocumentLanguageProps {
  languageDirection: string; // right to left (arabic etc.) or left to right (latin languages etc.)
  language: string;
}

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
  // Or fr-CA;q=0.8
  // This header has a weird syntax if we want a full parser
  // here we keep only the first value
  const locale = acceptLanguage.split(";")[0].split(",")[0]; //.slice(0, 5);
  return locale;
};

export const getReqCookies = (req: IncomingMessage) => {
  return req?.headers?.cookie;
};
/**
 * 1. Get from cookie
 * 2. Get from Accept-Language
 * TODO: should be in sync with middleware, that
 * also respect locale from URL
 *
 * Locale can have region or not: fr or fr-FR etc.
 *
 * TODO: we could also get the locale from the database
 * via the "user.locale" preference field
 * Not yet setup, this means an asynchronous call
 * 
 *
 * Next doesn't provide the locale in API requests
 * So we need custom logic
 * @see https://github.com/vercel/next.js/discussions/21798
 *
 * @param req
 * @returns
 */
export const getLocaleFromReq = (req: IncomingMessage) => {
  const fromAcceptLanguage = getLocaleFromAcceptLanguage(getReqCookies(req));
  if (fromAcceptLanguage) return fromAcceptLanguage;
  return undefined;
};
