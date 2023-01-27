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

  const lang = getLang(pathname)
  const file = isFile(pathname)
  const api = isApi(pathname)
  const shouldLocalize = !api && !file
  if (shouldLocalize && !lang) {
    const locale =
      getLocaleFromAcceptLanguage(request.headers.get("accept-language")) ||
      request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    const validLocale = getClosestLocale(locale);
    if (validLocale !== locale) {
      console.warn(
        `Locale ${locale} is not yet supported, falling back to ${locale}`
      );
    }
    const url = request.nextUrl.clone();
    console.debug("Will add locale", validLocale, "to", pathname)
    url.pathname = "/" + validLocale + pathname;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// middleware will run only on those paths
export const config = {
  // matcher: ["/", "/debug/:path*", "/api/crons/:path*"],
  // we can't use variables here
  //...debugAreaMatcher, ...cronMatcher],
};
