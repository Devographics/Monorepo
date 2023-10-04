import "~/stylesheets/main.scss";
import { Metadata } from "next";
import { setAppName } from "@devographics/helpers";
import { AppName } from "@devographics/types";
import { getConfig } from "@devographics/helpers";

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
    <html>
      <head />
      <body className={configClass}>{children}</body>
    </html>
  );
}

export const metadata: Metadata = {
  title: process.env.DEFAULT_TITLE || "Devographics Surveys",
  description:
    process.env.DEFAULT_DESCRIPTION ||
    "The State of JavaScript, State of CSS, State of HTML, and other developer surveys.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  // /app/favicon.ico is automatically used as icon
};
