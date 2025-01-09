import { Ratelimit } from "@upstash/ratelimit";
import { initRedis } from "@devographics/redis";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";

import { ipAddress } from "@vercel/functions";

// RATE LIMITING
// Rates are relatively high,
// these limits do not replace a protection against bots

initRedis()
/**
 * For all POST requests
 * like saving responses
 */
export const ratelimitLax= new Ratelimit({
    redis: initRedis(),
    limiter: Ratelimit.fixedWindow(100, "1m"),
    ephemeralCache: new Map(),
    prefix: "@upstash/ratelimit",
    analytics: true,
});
/**
 * For sensitive requests : login, mail sending
 */
export const ratelimitStrong = new Ratelimit({
    redis: initRedis(),
    limiter: Ratelimit.fixedWindow(10, "1m"),
    ephemeralCache: new Map(),
    prefix: "@upstash/ratelimit",
    analytics: true,
});

/**
 * @returns a response if the rate limit is exceeded, undefined otherwise
 */
export async function apiPostRateLimit(request: NextRequest, context: NextFetchEvent): Promise<NextResponse | undefined> {
    if (request.method === "POST") {
        // whitelisted routes that do not have a problematic side effect
        // - saving a response
        // - logging out
        if (request.url.match(/saveResponse|logout/)) {
            return undefined
        }
        const ip = ipAddress(request) || request.headers.get("x-forwarded-for")
        if (ip) {
            const limiter =
                // more sensitive routes that sends an email
                request.url.match(/sendEmail|sendReadingList/) ? ratelimitStrong : ratelimitLax
            const { success, pending, limit, remaining } = await limiter.limit(ip);
            // we use context.waitUntil since analytics: true.
            // see https://upstash.com/docs/oss/sdks/ts/ratelimit/gettingstarted#serverless-environments
            context.waitUntil(pending);
            if (!success) {
                if (process.env.NODE_ENV === "development") {
                    console.log("RATE LIMIT EXCEEDED in development (won't block the request)", { limit, remaining, ip })
                    return undefined
                }
                const res = NextResponse.json({ error: "Too many requests on POST endpoints for current IP", limit, remaining, ip }, {
                    status: 429,
                    headers: {
                        "X-RateLimit-Success": success.toString(),
                        // We don't show limits to avoid informing attackers
                        // "X-RateLimit-Limit": limit.toString(),
                        // "X-RateLimit-Remaining": remaining.toString(),
                    }
                })
                return res
            }
        }
    }
    return undefined
}