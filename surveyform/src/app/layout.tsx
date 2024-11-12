import "~/stylesheets/main.scss";
import type { Metadata, Viewport } from "next";
import { setAppName } from "@devographics/helpers";
import { AppName } from "@devographics/types";
import { getConfig } from "@devographics/helpers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { HeadScripts } from "~/components/common/HeadScripts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * NOTE: we also check env variable again at runtime, in instrumentation hook
   */
  setAppName(AppName.SURVEYFORM);
  const isDev = process.env.NODE_ENV === "development";
  getConfig({ showWarnings: isDev });

  const configClass = process.env.NEXT_PUBLIC_CONFIG
    ? `config-${process.env.NEXT_PUBLIC_CONFIG}`
    : "";

  return (
    // The RootLayout can't handle the "lang" tag
    // @see https://github.com/vercel/next.js/discussions/49415
    <html>
      <head>
        <HeadScripts />
      </head>
      <body className={configClass}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: process.env.DEFAULT_TITLE || "Devographics Surveys",
  description:
    process.env.DEFAULT_DESCRIPTION ||
    "The State of JavaScript, State of CSS, State of HTML, and other developer surveys.",
  // /app/favicon.ico is automatically used as icon
};
