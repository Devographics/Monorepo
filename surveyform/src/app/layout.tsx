import "~/stylesheets/main.scss";
import { Metadata } from "next";
import { setAppName } from "@devographics/helpers";
import { AppName } from "@devographics/types";
import { getConfig } from "@devographics/helpers";
import Script from "next/script";
import PlausibleProvider from "next-plausible";
import { publicConfig } from "~/config/public";
import { rscAllLocalesIds } from "~/lib/api/rsc-fetchers";

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
      <head>
        {/**
         * Source: https://vanillajstoolkit.com/polyfills/stringreplaceall/
         * needed for older versions of iOS Safari
         * At time of writing replaceAll has less than 95% support
         * @see https://caniuse.com/?search=replaceAll
         */}
        <Script src="/polyfills/replaceAll.js" strategy="beforeInteractive" />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <PlausibleProvider
            trackLocalhost={true}
            domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          />
        )}
      </head>
      <body className={configClass}>{children}</body>
    </html>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locales = await rscAllLocalesIds();
  return {
    metadataBase: new URL(publicConfig.appUrl),
    // TODO: make it a function and list all possible locales here
    alternates: {
      canonical: "/",
      languages: Object.fromEntries(
        locales?.data?.map((localeId) => [localeId, "/" + localeId]) || []
      ),
    },
    title: process.env.DEFAULT_TITLE || "Devographics Surveys",
    description:
      process.env.DEFAULT_DESCRIPTION ||
      "The State of JavaScript, State of CSS, State of HTML, and other developer surveys.",
    // /app/favicon.ico is automatically used as icon
  };
}

// Since Next 14 viewport is separate from metadata
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
