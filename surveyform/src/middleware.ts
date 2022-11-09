import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { debugAccessMiddleware } from "~/core/server/edge/debugMiddleware";
import { cronMiddleware } from "~/core/server/edge/cronMiddleware";

import { getLocaleFromAcceptLanguage } from "~/i18n/server/localeDetection";
import { LOCALE_COOKIE_NAME } from "./i18n/cookie";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // TODO: i18n redirection should happen for all paths
  //that do not start with a a valid locale
  // TODO: verify that the locale exists
  if (pathname === "/") {
    const locale =
      getLocaleFromAcceptLanguage(request.headers.get("accept-language")) ||
      request.cookies.get(LOCALE_COOKIE_NAME);
    const url = request.nextUrl.clone();
    url.pathname = "/" + locale;
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/debug")) {
    // TODO: can we run Sentry in an edge middleware?
    console.log("Accessing debug area");
    return debugAccessMiddleware(request);
  }
  if (pathname.startsWith("/api/crons")) {
    console.log("Accessing crons");
    return cronMiddleware(request);
  }

  return NextResponse.next();
}

// middleware will run only on those paths
export const config = {
  matcher: ["/", "/debug/:path*", "/api/crons/:path*"],
  // we can't use variables here
  //...debugAreaMatcher, ...cronMatcher],
};
