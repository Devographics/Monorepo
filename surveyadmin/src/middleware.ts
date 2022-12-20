import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  adminAreaMatcher,
  adminLoginMiddleware,
} from "~/admin/server/edge/adminMiddleware";
import {
  debugAccessMiddleware,
  debugAreaMatcher,
} from "~/core/server/edge/debugMiddleware";
import { cronMiddleware, cronMatcher } from "~/core/server/edge/cronMiddleware";

export function middleware(request: NextRequest) {
  // TODO: this condition should use the admin area matcher?
  const pathname = request.nextUrl.pathname;
  // if (pathname.startsWith("/admin")) {
  //   console.log("Accessing admin area");
  //   return adminLoginMiddleware(request);
  // }
  if (pathname.startsWith("/debug")) {
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
  matcher: [...adminAreaMatcher, ...debugAreaMatcher, ...cronMatcher],
};
