import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { debugAccessMiddleware } from "~/core/server/edge/debugMiddleware";
import { cronMiddleware } from "~/core/server/edge/cronMiddleware";

import { getLocaleFromAcceptLanguage } from "~/i18n/server/localeDetection";
import { LOCALE_COOKIE_NAME } from "./i18n/cookie";
import { getClosestLocale, locales } from "./i18n/data/locales";

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
function getLang(pathname: string) {
  const firstParam = getFirstParam(pathname)
  if (!firstParam) return null
  if (locales.includes(firstParam)) {
    console.debug("path includes lang", pathname)
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
      `In middleware, locale ${locale} is not yet supported, falling back to ${locale}`
    );
  }
  // add or replace locale
  let url = request.nextUrl.clone();
  if (langFromPath && validLocale != langFromPath) {
    console.debug("Will replace locale", langFromPath, "by", validLocale, "in", url.pathname)
    // replace locale
    url.pathname = url.pathname.replace(langFromPath, validLocale)
  } else if (!langFromPath) {
    console.debug("Will add locale", validLocale, "to", url.pathname)
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
