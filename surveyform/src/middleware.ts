import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { debugAccessMiddleware } from "~/core/server/edge/debugMiddleware";
import { cronMiddleware } from "~/core/server/edge/cronMiddleware";

import { getLocaleFromAcceptLanguage } from "~/i18n/server/localeDetection";
import { LOCALE_COOKIE_NAME } from "./i18n/cookie";
import { getClosestLocale, locales } from "./i18n/data/locales";
import { splitPath } from "@devographics/react-form/components/form/utils/path_utils";

function getFirstParam(pathname: string) {
  if (!pathname) {
    console.warn("Empty pathname")
    return null
  }
  const segments = pathname.split("/")
  if (segments.length < 2) {
    return null
  }
  const firstParam = segments[1]
  return firstParam
}


function maybeLocale(str: string) {
  const split = str.split("-")
  // fr-FR, zn-Hans...
  return split.length === 2 && split[0].length === 2 && split[1].length >= 2
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
function getLang(pathname: string) {
  const firstParam = getFirstParam(pathname)
  if (!firstParam) return null
  if (
    // it really looks like a locale (be careful to avoid using ambiguous params like filenames)
    maybeLocale(firstParam) ||
    // known locale
    locales.includes(firstParam) ||
    // matches a known country
    (firstParam.length === 2 && locales.map(l => l.slice(0, 2)).includes(firstParam))
  ) {
    return firstParam
  }
  return null
}
function isApi(pathname: string) {
  return getFirstParam(pathname) === "api"
}

function isFile(pathname: string) {
  return pathname.includes(".") || getFirstParam(pathname) === "_next"
}


function localize(request: NextRequest): NextResponse {
  const langFromPath = getLang(request.nextUrl.pathname)
  /**
   * Priorities:
   * 1. locale cookie
   * 2. lang already in URL
   * 3. accept-language header
   *
   * User can change locale cookie via the locale selector menu
   */
  const locale = request.cookies.get(LOCALE_COOKIE_NAME)?.value ||
    langFromPath ||
    getLocaleFromAcceptLanguage(request.headers.get("accept-language")) ||
    "en-US"
  // get the closest valid locale
  const validLocale = getClosestLocale(locale);
  if (validLocale !== locale) {
    console.warn(
      `In middleware, locale ${locale} is not yet supported, falling back to ${validLocale}`
    );
  }
  // add or replace locale
  let url = request.nextUrl.clone();
  if (langFromPath && (validLocale !== langFromPath)) {
    // console.debug("Will replace locale", langFromPath, "by", validLocale, "in", url.pathname)
    // replace locale
    url.pathname = url.pathname.replace(langFromPath, validLocale)
  } else if (!langFromPath) {
    //console.debug("Will add locale", validLocale, "to", url.pathname)
    // add locale
    url.pathname = "/" + validLocale + url.pathname;
  } else {
    // nothing to do 
    return NextResponse.next()
  }
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/debug")) {
    // TODO: can we run Sentry in an edge middleware?
    console.log("Accessing debug area");
    return debugAccessMiddleware(request);
  }

  if (pathname.startsWith("/api/crons")) {
    console.log("Accessing crons");
    return cronMiddleware(request);
  }

  const file = isFile(pathname)
  const api = isApi(pathname)
  const shouldLocalize = !api && !file
  if (shouldLocalize) {
    return localize(request)
  }

  return NextResponse.next();
}

// middleware will run only on those paths
export const config = {
  // matcher: ["/", "/debug/:path*", "/api/crons/:path*"],
  // we can't use variables here
  //...debugAreaMatcher, ...cronMatcher],
};
