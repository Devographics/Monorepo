// NOTE: we cannot import much code here as middleware use their own specific runtime
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const adminLoginUrl = "/admin/login";

export function adminLoginMiddleware(req: NextRequest) {
  const isFile = req.nextUrl.pathname.match("_next")
  if (isFile) return NextResponse.next()
  // TODO: this is not a real auth check!!! User can set a token manually!!!
  // We only avoid the most obvious unauthorized access
  const isAuth = req.cookies.get("token");
  const isAdminLoginPage = req.nextUrl.pathname === adminLoginUrl;
  if (!isAuth && !isAdminLoginPage) {
    // @see https://nextjs.org/docs/messages/middleware-relative-urls
    const url = req.nextUrl.clone();
    url.pathname = adminLoginUrl;
    console.warn(
      "Admin page cannot be accessed without at least a token, redirecting to admin login " +
      url.pathname
    );
    return NextResponse.redirect(url);
  }
  // can't access the login page if already authenticated
  if (isAuth && isAdminLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  // Access the page (NOTE: authenticated users can access the page! we do not do a real auth check yet!)
  return NextResponse.next();
}

export const adminAreaMatcher = ["/admin", "/admin/*"];
