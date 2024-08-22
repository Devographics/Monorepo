import { NextRequest } from "next/server";
import { HandlerError } from "~/lib/handler-error";

/**
 * The secret key system is necessary
 * for API endpoints that should be triggered programmatically:
 * - cron jobs
 * - cache resets
 * etc.
 * The SECRET_KEY environment variable should match the "key" query params
 * In Vercel, we have to use "CRON_SECRET" specifically
 * 
 * NOTE: this is NOT for secure endpoints like auth (secret is passed via URL as is)! 
 * Only endpoints that should not be abused too much by bots (or nosy users)
 */
export function checkSecretKey(req: NextRequest) {
    if (!process.env.SECRET_KEY) {
        console.warn("SECRET_KEY not configured, will prevent calling secured API endpoint for cache invalidation or recurring computations like score quantiles")
    }
    if (process.env.VERCEL && !process.env.CRON_SECRET) {
        console.warn("CRON_SECRET not configured while hosting on Vercel, will prevent calling secured API endpoint from cron jobs")
    }
    // 1. Using a secret key passed within the URL
    const key = req.nextUrl.searchParams.get("key");
    if (process.env.SECRET_KEY && key && key === process.env.SECRET_KEY) {
        return true
    }
    // 2. Or using a CRON_SECRET (Vercel)
    const authHeader = req.headers.get("Authorization")
    if (
        process.env.VERCEL && process.env.CRON_SECRET && authHeader && authHeader === `Bearer ${process.env.CRON_SECRET}`
    ) {
        return true
    }
    throw new HandlerError({ id: "invalid_key", message: "Invalid secret key" })
}