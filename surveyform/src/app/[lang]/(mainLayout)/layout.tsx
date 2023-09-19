import { Metadata } from "next";
import { rscCurrentUserWithResponses } from "~/account/user/rsc-fetchers/rscCurrentUser";
import ClientLayout from "~/app/[lang]/ClientLayout";
import { DebugRSC } from "~/components/debug/DebugRSC";
import { getCommonContexts, getLocaleIdFromParams } from "~/i18n/config";
import { rscAllLocalesMetadata, rscLocale } from "~/lib/api/rsc-fetchers";

// TODO: not yet compatible with having dynamic pages down the tree
// we may have to call generateStaticParams in each static page instead
// @see https://github.com/vercel/next.js/issues/44712
// export function generateStaticParams() {
//   return locales.map((l) => ({ lang: l }));
// }

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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}) {
  const contexts = getCommonContexts();
  const localeId = getLocaleIdFromParams(params);
  const {
    data: locale,
    error,
    ___metadata: ___rscLocale_CommonContexts,
  } = await rscLocale({
    localeId,
    contexts,
  });
  const { data: locales, ___metadata: ___rscAllLocalesMetadata } =
    await rscAllLocalesMetadata();
  if (error) {
    return <div>{JSON.stringify(error, null, 2)}</div>;
  }
  const currentUser = await rscCurrentUserWithResponses();
  return (
    <ClientLayout
      params={params}
      locales={locales}
      localeId={localeId}
      localeStrings={locale}
      currentUser={currentUser}
    >
      <DebugRSC
        {...{ ___rscLocale_CommonContexts, ___rscAllLocalesMetadata }}
      />
      {children}
    </ClientLayout>
  );
}
