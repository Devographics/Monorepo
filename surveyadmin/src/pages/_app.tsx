"use client";
// we don't need SSR for the admin area
import NoSSR from "react-no-ssr";
import { NextPage } from "next";
import App, { AppContext, AppProps } from "next/app";
import { ReactElement } from "react";

// Comment if you don't need Material UI
import { createEmotionCache } from "@vulcanjs/next-mui";
import { MuiThemeProvider } from "~/core/components/providers";

import Head from "next/head";

import debug from "debug";

const debugPerf = debug("vns:perf");
// @see https://nextjs.org/docs/advanced-features/measuring-performance
export function reportWebVitals(metric) {
  debugPerf(metric); // The metric object ({ id, name, startTime, value, label }) is logged to the console
}

import { CacheProvider, EmotionCache } from "@emotion/react";
import { useUser } from "~/account/user/hooks";

// TODO: still quite experimental, migrated specifically for the state of js
//import { LocaleContextProvider } from "@vulcanjs/i18n";
import { LocaleContextProvider } from "~/i18n/components/LocaleContext";
import { DefaultLocaleContextProvider } from "~/core/components/common/DefaultLocaleContext";

import "~/stylesheets/main.scss";

// Various side effects (registering locales etc.)
import "~/i18n";

import { ErrorBoundary } from "~/core/components/error";
import { getAppGraphqlUri } from "~/lib/graphql";
import Layout from "~/core/components/common/Layout";
//import { useCookies } from "react-cookie";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

// @see https://nextjs.org/docs/basic-features/layouts#with-typescript
// Doc says to use "ReactNode" as the return type at the time of writing (09/2021) but then that fails appWithTranslation
// , ReactElement seems more appropriate
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactElement; //ReactNode;
};

export interface VNAppProps extends AppProps {
  Component: NextPageWithLayout;
  emotionCache: EmotionCache;
  /** Locale extracted from cookies server-side */
  pageProps: {
    locale?: string;
    localeStrings?: any;
    initialApolloState?: any;
    // When on a specific survey
    year?: string;
    slug?: string;
  };
  /**
   * The request origin
   * Will allow to have consistent SSR without needing
   * to setup an explicit graphql URI
   */
  //origin?: string;
}

const Favicons = () => (
  <>
    {/* Favicon created using https://realfavicongenerator.net/ */}
    <link rel="manifest" href="/site.webmanifest"></link>
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"></link>
    <meta name="msapplication-TileColor" content="#da532c"></meta>
    <meta name="theme-color" content="#ffffff"></meta>
  </>
);

function VNApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: VNAppProps) {
  // Use the layout defined at the page level, if available
  // @see https://nextjs.org/docs/basic-features/layouts
  const { user } = useUser();

  const getLayout = Component.getLayout ?? ((page) => page);

  const { locale, localeStrings } = pageProps;

  return (
    <NoSSR>
      <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
        {/** TODO: this error boundary to display anything useful since it doesn't have i18n */}
        {getLayout(
          <CacheProvider value={emotionCache}>
            <DefaultLocaleContextProvider>
              <LocaleContextProvider
                locale={locale}
                localeStrings={localeStrings}
                currentUser={user}
              >
                <Head>
                  <title>State of JS</title>
                  <meta
                    name="viewport"
                    content="minimum-scale=1, initial-scale=1, width=device-width"
                  />
                  <Favicons />
                </Head>
                {/** Provide MUI theme but also mui utilities like CSS baseline, StyledEngineProvider... */}
                <MuiThemeProvider>
                  {/** This ErrorBoundary have Mui theming + i18n + Vulcan components */}
                  <ErrorBoundary
                    proposeReload={true}
                    proposeHomeRedirection={true}
                  >
                    <Layout
                      surveySlug={pageProps?.slug}
                      surveyYear={pageProps?.year}
                    >
                      {/** @ts-ignore */}
                      <Component {...pageProps} />
                    </Layout>
                  </ErrorBoundary>
                </MuiThemeProvider>
              </LocaleContextProvider>
            </DefaultLocaleContextProvider>
          </CacheProvider>
        )}
      </ErrorBoundary>
    </NoSSR>
  );
}

export default VNApp;
