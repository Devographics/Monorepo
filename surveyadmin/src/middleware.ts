import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // NOTE: env variables are injected at BUILD-TIME in middleware
  // we need a rebuild to change the value
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isProd = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEl;
  // we skip auth in local development
  if (!isProd && !isVercel) {
    return NextResponse.next();
  }
  // try to auth
  const basicAuthToken = req.headers.get("authorization");
  if (basicAuthToken) {
    const authValue = basicAuthToken.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");
    if (isProd && adminPassword === "password") {
      const res = new Response(
        "Using development password in production, please change password.",
        { status: 401 }
      );
      res.headers.set(
        "WWW-Authenticate",
        'Basic realm="Devographics Surveyadmin"'
      );
      return res;
    }
    if (user === adminUser && pwd === adminPassword) {
      // back to home after login
      return NextResponse.next();
    }
  }
  // failed to auth
  const res = new Response("Not allowed", { status: 401 });
  res.headers.set("WWW-Authenticate", 'Basic realm="Devographics Surveyadmin"');
  return res;
}

export const config = {
  matcher: "/(.*)",
};
