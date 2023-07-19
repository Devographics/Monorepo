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

  return (
    <html>
      <head />
      <body>{children}</body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Devographics Surveys",
  description: "State of JavaScript, CSS, GraphQL and friends",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  // /app/favicon.ico is automatically used as icon
};
