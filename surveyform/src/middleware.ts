import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { debugAccessMiddleware } from "~/core/server/edge/debugMiddleware";
import { cronMiddleware } from "~/core/server/edge/cronMiddleware";

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

  return NextResponse.next();
}

// middleware will run only on those paths
export const config = {
  matcher: ["/debug/:path*", "/api/crons/:path*"],
  // we can't use variables here
  //...debugAreaMatcher, ...cronMatcher],
};
