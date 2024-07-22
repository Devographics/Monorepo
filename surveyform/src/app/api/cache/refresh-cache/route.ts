import { NextRequest, NextResponse } from "next/server";
import {
  refreshSurveysCache,
  refreshLocalesCache,
  flushInMemoryCache,
} from "@devographics/fetch";
import { HandlerError } from "~/lib/handler-error";
import { revalidatePath } from "next/cache";

/**
 * @see https://vercel.com/docs/functions/serverless-functions/runtimes#maxduration
 * On PRO offer we are allowed for 300s execution max (default is 10s so too short for loading all locales)
 */
export const maxDuration = 300;

/**
 * Empties Surveyform Redis cache
 *
 * ?items=surveys&items=entities => reload only specific items
 * ?en-only => reload only the en locale (for testing purposes)
 * @param req
 * @returns
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.SECRET_KEY) {
    throw new HandlerError({ id: "key-error", message: "Invalid key" });
  } else {
    // @see WatchedItems type in API

    const items = req.nextUrl.searchParams.getAll("items");
    if (!items.length) {
      // reset everything is no items are provided
      items.push("surveys", "locales", "entities");
    }

    console.log(
      `💾 Refreshing Redis & in-memory cache… (items: ${items.join()})`
    );

    const enOnly = req.nextUrl.searchParams.get("en-only");

    if (items.includes("surveys")) {
      await refreshSurveysCache({ target: "production" });
    }
    if (items.includes("locales")) {
      // Load en-US first so we get immediate results in dev
      await refreshLocalesCache({ target: "production", localeIds: ["en-US"] });
      if (!enOnly) {
        // Cleanup other locales (may take a few seconds)
        await refreshLocalesCache({ target: "production" }); //
      }
    }
    // Currently we don't cache entities
    // if (items.includes("entities")) {
    // }
    // Also empty the in-memory cache for immediate results
    flushInMemoryCache();

    // This also invalidates all statically rendered contents
    revalidatePath("/", "layout");

    return NextResponse.json({ data: { result: "ok", refreshed: items } });
  }
}
