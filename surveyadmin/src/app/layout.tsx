import "~/stylesheets/main.scss";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { getConfig, setAppName } from "@devographics/helpers";
import { AppName } from "@devographics/types";

// We don't want static rendering in survey admin
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  setAppName(AppName.SURVEYADMIN);
  const isDev = process.env.NODE_ENV === "development";
  // call getConfig the first time and show warnings if this is local dev env
  getConfig({ appName: AppName.SURVEYADMIN, showWarnings: isDev });
  return (
    <html>
      <head />
      <body>
        <nav className="main-nav">
          <ul>
            <li>
              <Link href="/admin/cache">Cache</Link>
            </li>
            <li>
              <Link href="/admin/export">Export</Link>
            </li>
            <li>
              <Link href="/admin/normalization">Normalization</Link>
            </li>
            <li>
              <Link href="/admin/scripts">Scripts</Link>
            </li>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Devographics Admin",
  description: "Admin app for the Devographics surveys",
  // /app/favicon.ico is automatically used as icon
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
