"use client";
import { Loading } from "~/core/components/ui/Loading";
import { Button } from "~/core/components/ui/Button";
import { Alert } from "~/core/components/ui/Alert";
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

import { ApolloProvider } from "@apollo/client";
import { useApollo } from "@vulcanjs/next-apollo";
import { useUser } from "~/account/user/hooks";

import { LocaleContextProvider } from "~/i18n/components/LocaleContext";

import { FormattedMessage } from "~/core/components/common/FormattedMessage";

import { ErrorBoundary } from "~/core/components/error";
import { getAppGraphqlUri } from "~/lib/graphql";
import Layout from "~/core/components/common/Layout";
import type { LocaleDef } from "~/i18n/typings";
import { SSRProvider } from "react-bootstrap";
import { SWRConfig } from "swr";

export interface AppLayoutProps {
  /** Locale extracted from cookies server-side */
  locale: string;
  localeStrings: LocaleDef;
  locales?: Array<LocaleDef>;
  initialApolloState?: any;
  // When on a specific survey
  // TODO: will be handled by a nested layout later on
  year?: string;
  slug?: string;
  children: React.ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const {
    children,
    initialApolloState,
    locale,
    locales,
    localeStrings,
    slug,
    year,
  } = props;
  const apolloClient = useApollo(initialApolloState, {
    graphqlUri: getAppGraphqlUri(/*origin*/),
    crossDomainGraphqlUri:
      !!process.env.NEXT_PUBLIC_CROSS_DOMAIN_GRAPHQL_URI || false,
  }); // you can also easily setup ApolloProvider on a per-page basis
  // Use the layout defined at the page level, if available
  // @see https://nextjs.org/docs/basic-features/layouts
  const { user } = useUser();

  return (
    <SSRProvider>
      <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
        {/** TODO: this error boundary to display anything useful since it doesn't have i18n */}
        {
          <ApolloProvider client={apolloClient}>
            <SWRConfig
              value={{
                // basic global fetcher
                fetcher: (resource, init) =>
                  fetch(resource, init).then((res) => res.json()),
              }}
            >
              <LocaleContextProvider
                locales={locales}
                localeId={locale}
                localeStrings={localeStrings}
                currentUser={user}
              >
                <VulcanCurrentUserProvider
                  // @ts-ignore FIXME: weird error with groups
                  value={{
                    currentUser: user || null,
                    loading:
                      false /* TODO: we don't get the loading information from useUser yet */,
                  }}
                >
                  <ErrorBoundary
                    proposeReload={true}
                    proposeHomeRedirection={true}
                  >
                    <Layout>{children}</Layout>
                  </ErrorBoundary>
                </VulcanCurrentUserProvider>
              </LocaleContextProvider>
            </SWRConfig>
          </ApolloProvider>
        }
      </ErrorBoundary>
    </SSRProvider>
  );
}
