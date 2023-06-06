import { Metadata } from "next";
import AppLayout from "~/app/[lang]/AppLayout";
import { fetchAllLocalesMetadata, fetchLocaleCached } from "~/lib/api/fetch";
import { getCommonContexts, getLocaleIdFromParams } from "~/i18n/config";

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
  const locale = await fetchLocaleCached({ localeId, contexts });
  const locales = await fetchAllLocalesMetadata();
  return (
    <AppLayout
      params={params}
      locales={locales}
      localeId={localeId}
      localeStrings={locale}
    >
      {children}
    </AppLayout>
  );
}
