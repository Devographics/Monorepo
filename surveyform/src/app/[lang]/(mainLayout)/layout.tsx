import { Metadata } from "next";
import ClientLayout from "~/app/[lang]/ClientLayout";
import { DebugRSC } from "~/components/debug/DebugRSC";
import { getCommonContexts, getLocaleIdFromParams } from "~/i18n/config";
import { rscIntlContext } from "~/i18n/rsc-fetchers";
import { rscAllLocalesMetadata, rscLocale } from "~/lib/api/rsc-fetchers";

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
}): // parent: ResolvingMetadata
Promise<Metadata | undefined> {
  const contexts = getCommonContexts();
  const intlContext = await rscIntlContext({ localeId: params.lang, contexts });
  const title = intlContext.formatMessage({ id: "general.title" });
  const description = intlContext.formatMessage({ id: "general.description" });
  // const defaultMetadata = await parent;
  // There is no need to explicitely merge with parent, unless we override nested objects like openGraph
  const metadata = { title, description };
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
  return (
    <ClientLayout
      params={params}
      locales={locales}
      localeId={localeId}
      localeStrings={locale}
    >
      <DebugRSC
        {...{ ___rscLocale_CommonContexts, ___rscAllLocalesMetadata }}
      />
      {children}
    </ClientLayout>
  );
}
