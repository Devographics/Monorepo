import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { apiPostRateLimit } from "./edge-middleware/ratelimit";
import { localize } from "./edge-middleware/locale";
import { isApi, isFile } from "./edge-middleware/pathname";


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
