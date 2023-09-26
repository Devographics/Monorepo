import { NextRequest } from "next/server";
import { HandlerError } from "~/lib/handler-error";

/**
 * The secret key system is necessary
 * for API endpoints that should be triggered programmatically:
 * - cron jobs
 * - cache resets
 * etc.
 * The SECRET_KEY environment variable should match the "key" query params
 * 
 * NOTE: this is NOT for secure endpoints like auth (secret is passed via URL as is)! 
 * Only endpoints that should not be abused too much by bots (or nosy users)
 */
export function checkSecretKey(req: NextRequest) {
    const key = req.nextUrl.searchParams.get("key");
    if (key !== process.env.SECRET_KEY) {
        throw new HandlerError({ id: "invalid_key", message: "Invalid secret key" })
    }
}