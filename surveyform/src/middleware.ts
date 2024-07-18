import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getLocaleFromAcceptLanguage } from "~/i18n/server/localeDetection";
import { LOCALE_COOKIE_NAME } from "./i18n/cookie";
import { getClosestLocale } from "./i18n/data/locales";
// @devographics/fetch is expected to have an "edge-light" export to work in middlewares
// https://runtime-keys.proposal.wintercg.org/
import { fetchAllLocalesIds } from "@devographics/fetch";

function getFirstParam(pathname: string) {
  if (!pathname) {
    console.warn("Empty pathname");
    return null;
  }
  const segments = pathname.split("/");
  if (segments.length < 2) {
    return null;
  }
  const firstParam = segments[1];
  return firstParam;
}

function maybeLocale(str: string) {
  const split = str.split("-");
  // fr-FR, zn-Hans...
  return split.length === 2 && split[0].length === 2 && split[1].length >= 2;
}
/**
 * If the first parameter of the pathname looks like a locale
 * returns it
 * returns null otherwise
 *
 * It should also work with unsupported locales, like fr-CA
 * @param pathname
 * @returns
 */
async function getLang(pathname: string) {
  // NOTE: this call will fire a lot of request but it's ok since we use a short-lived in-memory cache
  // robust to // calls
  const { data: localesIds } = await fetchAllLocalesIds();
  const firstParam = getFirstParam(pathname);
  if (!firstParam) return null;
  if (
    // it really looks like a locale (be careful to avoid using ambiguous params like filenames)
    maybeLocale(firstParam) ||
    // or it's a known locale
    localesIds.includes(firstParam) ||
    // or it matches a known country
    (firstParam.length === 2 &&
      localesIds.map((l) => l.slice(0, 2)).includes(firstParam))
  ) {
    return firstParam;
  }
  return null;
}
function isApi(pathname: string) {
  return getFirstParam(pathname) === "api";
}

function isFile(pathname: string) {
  return pathname.includes(".") || getFirstParam(pathname) === "_next";
}

async function localize(request: NextRequest): Promise<NextResponse> {
  const langFromPath = await getLang(request.nextUrl.pathname);
  /**
   * Priorities:
   * 1. lang already in URL
   * 2. locale cookie : user can change locale cookie via the locale selector menu
   * 3. accept-language header
   *
   * This order may affect the LocaleSwitcher implementation,
   * be careful with how it handle URL based redirection when the cookie is changed
   */
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const pathLocale = langFromPath;
  const headerLocale = getLocaleFromAcceptLanguage(
    request.headers.get("accept-language")
  );
  const defaultLocale = "en-US";
  const locale = pathLocale || cookieLocale || headerLocale || defaultLocale;

  // get the closest valid locale
  const validLocale = await getClosestLocale(locale);

  if (validLocale !== locale) {
    console.warn(
      `In middleware, locale ${locale} is not yet supported, falling back to ${validLocale}`
    );
  }
  // add or replace locale
  let url = request.nextUrl.clone();
  if (langFromPath && validLocale !== langFromPath) {
    // console.debug("Will replace locale", langFromPath, "by", validLocale, "in", url.pathname)
    // replace locale
    url.pathname = url.pathname.replace(langFromPath, validLocale);
  } else if (!langFromPath) {
    //console.debug("Will add locale", validLocale, "to", url.pathname)
    // add locale
    url.pathname = "/" + validLocale + url.pathname;
  } else {
    // nothing to do
    return NextResponse.next();
  }
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // NOTE: _next/static files are already bypassed by the matcher
  // but next/public files could be matched
  const file = isFile(pathname);
  // NOTE: current matcher bypasses API calls anyway
  // it should be reenabled if we implement bot protections etc.
  const api = isApi(pathname);
  const shouldLocalize = !api && !file;
  if (shouldLocalize) {
    return await localize(request);
  }

  NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - API routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
