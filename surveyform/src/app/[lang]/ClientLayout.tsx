"use client";
/**
 * Component that sets client-specific contexts
 *
 * Some of those contexts could be rendered in a RSC instead,
 * but only when they take serializable values as params
 *
 * For instance SWRConfig expects a "fetcher" which is a client-side function,
 * so it has to be rendered by a client component
 */
import React from "react";

// @see https://nextjs.org/docs/advanced-features/measuring-performance
/*
TODO: planned in v13 but not yet available 2022/11
export function reportWebVitals(metric) {
  debugPerf(metric); // The metric object ({ id, name, startTime, value, label }) is logged to the console
}
*/
import { LocaleContextProvider } from "~/i18n/context/LocaleContext";

import { ErrorBoundary } from "~/components/error";
import Layout from "~/components/common/Layout";
import type { LocaleDef, LocaleDefWithStrings } from "~/i18n/typings";
import { SWRConfig } from "swr";
import { KeydownContextProvider } from "~/components/common/KeydownContext";
import { UserMessagesProvider } from "~/components/common/UserMessagesContext";

import { Analytics } from "@vercel/analytics/react";
import { Referrer } from "~/components/common/ReferrerStorage";

export interface AppLayoutProps {
  /** Locale extracted from cookies server-side */
  localeId: string;
  localeStrings: LocaleDefWithStrings;
  locales: Array<LocaleDef>;
  // When on a specific survey
  children: React.ReactNode;
  params: { lang: string };
  addWrapper?: boolean;
}

export function ClientLayout(props: AppLayoutProps) {
  const {
    children,
    localeId,
    locales,
    localeStrings,
    params,
    addWrapper = true,
  } = props;

  return (
    <html lang={params.lang}>
      {/*
      <head /> will contain the components returned by the nearest parent
      head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
    */}
      <head />
      <body>
        {/** @ts-ignore */}
        <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
          {/** TODO: this error boundary to display anything useful since it doesn't have i18n */}
          <SWRConfig
            value={{
              // basic global fetcher
              fetcher: (resource, init) =>
                fetch(resource, init).then((res) => res.json()),
            }}
          >
            <LocaleContextProvider
              locales={locales}
              localeId={localeId}
              localeStrings={localeStrings}
            >
              {/** @ts-ignore */}
              <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
                <KeydownContextProvider>
                  <UserMessagesProvider>
                    {addWrapper ? <Layout>{children}</Layout> : children}
                  </UserMessagesProvider>
                </KeydownContextProvider>
              </ErrorBoundary>
            </LocaleContextProvider>
          </SWRConfig>
        </ErrorBoundary>
        <Referrer />
        <Analytics />
      </body>
    </html>
  );
}

export default ClientLayout;
