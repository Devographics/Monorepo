import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { getLocaleFromAcceptLanguage } from "~/lib/i18n/server/localeDetection";
import { getClosestLocale } from "./lib/i18n/data/locales";
// @devographics/fetch is expected to have an "edge-light" export to work in middlewares
// https://runtime-keys.proposal.wintercg.org/
import { fetchAllLocalesIds } from "@devographics/fetch";

import { Ratelimit } from "@upstash/ratelimit";
import { initRedis } from "@devographics/redis";

// RATE LIMITING

initRedis()
/**
 * 50 requests per 10 seconds fixed size window
 */
const ratelimit = new Ratelimit({
  redis: initRedis(),
  limiter: Ratelimit.fixedWindow(50, "10s"),
  ephemeralCache: new Map(),
  prefix: "@upstash/ratelimit",
  analytics: true,
});

/**
 * @returns a response if the rate limit is exceeded, undefined otherwise
 */
async function apiPostRateLimit(request: NextRequest, context: NextFetchEvent): Promise<NextResponse | undefined> {
  if (request.method === "POST") {
    // whitelisted routes that do not have a problematic side effect
    // - saving a response
    // - logging out
    if (request.url.match(/saveResponse|logout/)) {
      return undefined
    }
    const ip = request.ip || request.headers.get("x-forwarded-for")
    if (ip) {
      const { success, pending, limit, remaining } = await ratelimit.limit(ip);
      // we use context.waitUntil since analytics: true.
      // see https://upstash.com/docs/oss/sdks/ts/ratelimit/gettingstarted#serverless-environments
      context.waitUntil(pending);
      if (!success) {
        const res = NextResponse.json({ error: "Too many requests on POST endpoints for current IP", limit, remaining, ip }, {
          status: 429,
          headers: {
            "X-RateLimit-Success": success.toString(),
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
          }
        })
        return res
      }
    }
  }
  return undefined
}

// I18N

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
   * 2. accept-language header
   *
   * This order may affect the LocaleSwitcher implementation,
   * be careful with how it handle URL based redirection when the cookie is changed
   */
  const pathLocale = langFromPath;
  const headerLocale = getLocaleFromAcceptLanguage(
    request.headers.get("accept-language")
  );
  const defaultLocale = "en-US";
  const locale = pathLocale || headerLocale || defaultLocale;

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

export async function middleware(request: NextRequest, context: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;
  // NOTE: _next/static files are already bypassed by the matcher
  // but next/public files could be matched
  const file = isFile(pathname);
  // NOTE: current matcher bypasses API calls anyway
  // it should be reenabled if we implement bot protections etc.
  const api = isApi(pathname);

  if (api) {
    const rateLimitResponse = await apiPostRateLimit(request, context)
    if (rateLimitResponse) return rateLimitResponse
  }

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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
