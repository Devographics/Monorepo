import type { Metadata } from "next";
import ClientLayout from "~/app/[lang]/ClientLayout";
import {
  rscAllLocalesMetadata,
  rscLocaleFromParams,
} from "~/lib/i18n/api/rsc-fetchers";
import { metadata as defaultMetadata } from "../../layout";
import { rscTeapot } from "~/lib/i18n/components/ServerT";
import { getCommonContexts } from "~/lib/i18n/config";
import { notFound } from "next/navigation";

// TODO: not yet compatible with having dynamic pages down the tree
// we may have to call generateStaticParams in each static page instead
// @see https://github.com/vercel/next.js/issues/44712
// export function generateStaticParams() {
//   return locales.map((l) => ({ lang: l }));
// }

interface PageServerProps {
  lang: string;
}

export async function generateMetadata(props: {
  params: Promise<PageServerProps>;
}): Promise<Metadata> {
  const params = await props.params;
  const { t, error } = await rscTeapot({ localeId: params.lang });
  if (error) return defaultMetadata;
  const title = t("general.title");
  const description = t("general.description");
  const metadata = { ...defaultMetadata, title, description };
  return metadata;
}

/**
 * When a file is not found in "/public"
 * Next will try to match a route
 * so it will treat the file as the [lang] parameter, erroneously
 * so lang = "/apple-touch-icon.png" for instance
 * We need to catch this scenario in the layout
 * @param params
 */
function ignoreNotFoundFile(params) {
  if (params.lang.includes(".")) {
    notFound();
  }
}

/**
 *  TODO for i18n:
 * - Footer "LinkItem" is displaying error messages that are selected dynamically
 * - UserMessages too
 * - Dropdown too
 */

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}) {
  const params = await props.params;

  const { children } = props;

  ignoreNotFoundFile(params);
  const { locale, error } = await rscLocaleFromParams({
    ...params,
    contexts: getCommonContexts(),
  });
  const { data: locales, ___metadata: ___rscAllLocalesMetadata } =
    await rscAllLocalesMetadata();
  if (error) {
    return <div>{JSON.stringify(error, null, 2)}</div>;
  }
  return (
    <ClientLayout params={params} locales={locales} localeStrings={locale}>
      {/*<DebugRSC
        {...{ ___rscLocale_CommonContexts, ___rscAllLocalesMetadata }}
  />*/}
      {children}
    </ClientLayout>
  );
}
