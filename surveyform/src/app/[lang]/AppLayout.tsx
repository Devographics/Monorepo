"use client";
import { VulcanCurrentUserProvider } from "@devographics/react-form";

import debug from "debug";
const debugPerf = debug("vns:perf");
// @see https://nextjs.org/docs/advanced-features/measuring-performance
/*
TODO: planned in v13 but not yet available 2022/11
export function reportWebVitals(metric) {
  debugPerf(metric); // The metric object ({ id, name, startTime, value, label }) is logged to the console
}
*/

import { useUser } from "~/account/user/hooks";

import { LocaleContextProvider } from "~/i18n/context/LocaleContext";

import { ErrorBoundary } from "~/core/components/error";
import Layout from "~/core/components/common/Layout";
import type { LocaleDef, LocaleDefWithStrings } from "~/i18n/typings";
import SSRProvider from "react-bootstrap/SSRProvider";
import { SWRConfig } from "swr";

export interface AppLayoutProps {
  /** Locale extracted from cookies server-side */
  localeId: string;
  localeStrings: LocaleDefWithStrings;
  locales: Array<LocaleDef>;
  // When on a specific survey
  children: React.ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const { children, localeId, locales, localeStrings } = props;
  const { user } = useUser();
  return (
    <SSRProvider>
      {/** @ts-ignore */}
      <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
        {/** TODO: this error boundary to display anything useful since it doesn't have i18n */}
        {
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
              <VulcanCurrentUserProvider
                // @ts-ignore FIXME: weird error with groups
                value={{
                  currentUser: user || null,
                  loading:
                    false /* TODO: we don't get the loading information from useUser yet */,
                }}
              >
                {/** @ts-ignore */}
                <ErrorBoundary
                  proposeReload={true}
                  proposeHomeRedirection={true}
                >
                  <Layout>{children}</Layout>
                </ErrorBoundary>
              </VulcanCurrentUserProvider>
            </LocaleContextProvider>
          </SWRConfig>
        }
      </ErrorBoundary>
    </SSRProvider>
  );
}
