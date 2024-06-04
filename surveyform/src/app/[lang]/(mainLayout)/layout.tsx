import { Metadata } from "next";
import ClientLayout from "~/app/[lang]/ClientLayout";
import { rscAllLocalesMetadata, rscLocaleFromParams } from "~/lib/api/rsc-fetchers";
import { metadata as defaultMetadata } from "../../layout";
import { rscTeapot } from "~/i18n/components/ServerT";
import { setLocaleIdServerContext } from "~/i18n/rsc-context";
import { filterClientSideStrings } from "@devographics/i18n/server";

// TODO: not yet compatible with having dynamic pages down the tree
// we may have to call generateStaticParams in each static page instead
// @see https://github.com/vercel/next.js/issues/44712
// export function generateStaticParams() {
//   return locales.map((l) => ({ lang: l }));
// }

interface PageServerProps {
  lang: string;
}

export async function generateMetadata({
  params,
}: {
  params: PageServerProps;
}): Promise<Metadata | undefined> {
  const { t, error } = await rscTeapot()
  if (error) return defaultMetadata
  const title = t("general.title")
  const description = t("general.description")
  const metadata = { ...defaultMetadata, title, description };
  return metadata;
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}) {
  setLocaleIdServerContext(params.lang) // Needed for "ServerT"
  const { locale, localeId, error } = await rscLocaleFromParams(params)
  const { data: locales, ___metadata: ___rscAllLocalesMetadata } =
    await rscAllLocalesMetadata();
  if (error) {
    return <div>{JSON.stringify(error, null, 2)}</div>;
  }
  // TODO: see "Layout" to get the right expressions
  const tokenExprs = []
  const clientSideLocale = filterClientSideStrings<{}>(locale, tokenExprs, {})
  return (
    // TODO: stop passing all the locales there, filter them per page
    <ClientLayout
      params={params}
      locales={locales}
      localeId={localeId}
      localeStrings={locale}
    >
      {/*<DebugRSC
        {...{ ___rscLocale_CommonContexts, ___rscAllLocalesMetadata }}
  />*/}
      {children}
    </ClientLayout>
  );
}
