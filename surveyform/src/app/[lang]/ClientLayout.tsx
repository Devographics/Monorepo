"use client";
/**
 * Component that sets client-specific contexts
 * and initialize them with server fetched data when possible
 *
 * Some of those contexts could be rendered in a RSC instead,
 * but only when they take serializable values as params
 *
 * For instance SWRConfig expects a "fetcher" which is a client-side function,
 * so it has to be rendered by a client component
 *
 * Note: useReportWebVitals is not needed anymore in Next when using Vercel
 * https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals#usage-on-vercel
 */
import React, { useEffect } from "react";

import { ErrorBoundary } from "~/components/error";
import Layout from "~/components/common/Layout";
import { SWRConfig } from "swr";
import { KeydownContextProvider } from "~/components/common/KeydownContext";
import { UserMessagesProvider } from "~/components/common/UserMessagesContext";

import { Analytics } from "@vercel/analytics/react";
import { Referrer } from "~/components/common/ReferrerStorage";
import { ApiData, apiRoutes } from "~/lib/apiRoutes";
import { UserWithResponses } from "~/lib/responses/typings";
import { type LocaleParsed, type Locale } from "@devographics/i18n";
import { I18nContextProvider } from "@devographics/react-i18n";

export interface AppLayoutProps {
  /** Locale extracted from cookies server-side */
  localeStrings: LocaleParsed;
  locales: Array<Locale>;
  // When on a specific survey
  children: React.ReactNode;
  params: { lang: string };
  addWrapper?: boolean;
  /**
   * Initialize SWR data from server
   * NOTE: using this prop will make all the pages nested within this layout "dynamic" pages
   * You may want to pass this value directly to the useCurrentUser hook in specific pages that need the currentUser
   */
  currentUser?: UserWithResponses | null;
}

export function ClientLayout(props: AppLayoutProps) {
  const {
    children,
    locales,
    localeStrings,
    params,
    addWrapper = true,
    currentUser,
  } = props;

  let fallback: { [key: string]: ApiData<any> } = {};
  if (currentUser) {
    fallback[apiRoutes.account.currentUser.href()] = {
      data: currentUser,
      error: null,
    };
  }

  // client-side palliative
  // @see https://github.com/vercel/next.js/discussions/49415
  useEffect(() => {
    document.documentElement.lang = params.lang;
    return () => {
      document.documentElement.lang = "";
    };
  }, [params.lang]);

  return (
    <>
      {/*
     @see https://github.com/vercel/next.js/discussions/49415
      <html lang={params.lang}>
      */}
      {/** @ts-ignore */}
      <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
        {/** TODO: this error boundary to display anything useful since it doesn't have i18n */}
        <SWRConfig
          value={{
            // basic global fetcher
            fetcher: (resource, init) =>
              fetch(resource, init).then((res) => res.json()),
            // @see https://swr.vercel.app/docs/with-nextjs#pre-rendering-with-default-data,
            fallback,
          }}
        >
          <I18nContextProvider locale={localeStrings} allLocales={locales}>
            {/** @ts-ignore */}
            <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
              <KeydownContextProvider>
                <UserMessagesProvider>
                  {addWrapper ? <Layout>{children}</Layout> : children}
                </UserMessagesProvider>
              </KeydownContextProvider>
            </ErrorBoundary>
          </I18nContextProvider>
        </SWRConfig>
      </ErrorBoundary>
      <Referrer />
      <Analytics />
    </>
  );
}

export default ClientLayout;
