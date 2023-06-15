/**
 * @see https://github.com/paulphys/nextjs-cron
 * @see https://github.com/vercel/examples/blob/main/edge-functions/basic-auth-password/pages/_middleware.ts
 */
import { NextRequest, NextResponse } from "next/server";

export function cronMiddleware(req: NextRequest) {
  const { GITHUB_ACTIONS_APP_KEY } = process.env;
  if (!GITHUB_ACTIONS_APP_KEY) {
    throw new Error(`GITHUB_ACTIONS_APP_KEY not setup, cannot run cron jobs.`);
  }
  const authorization = req.headers.get("authorization");
  if (!authorization)
    throw new Error("No authorization header set when calling cron job.");
  const authorizationSplit = authorization.split(" ");
  if (authorizationSplit.length < 2) {
    throw new Error(
      "Invalid authorization string, should have form 'Something ABCDEF'"
    );
  }
  const ACTION_KEY = authorizationSplit[1];
  if (ACTION_KEY === GITHUB_ACTIONS_APP_KEY) {
    // Process the POST request
    return new Response("Invalid GitHubAction ACTION_KEY", { status: 401 });
  }
  return NextResponse.next();
}

// This doesn't work,
// middleware matchers have to be defined statically
export const cronMatcher = ["/api/crons/*"];
