import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditionProvider } from "~/components/SurveyContext/Provider";

import { rscMustGetSurveyEditionFromUrl } from "./rsc-fetchers";
import ClientLayout from "~/app/[lang]/ClientLayout";
import EditionLayout from "~/components/common/EditionLayout";

import { getEditionHomePath } from "~/lib/surveys/helpers/getEditionHomePath";
import {
  getCommonContexts,
  getEditionContexts,
  getSurveyContexts,
  safeLocaleIdFromParams,
} from "~/i18n/config";
import {
  rscAllLocalesMetadata,
  rscLocaleFromParams,
} from "~/lib/api/rsc-fetchers";
// import { rscGetMetadata } from "~/lib/surveys/rsc-fetchers";
import { DebugRSC } from "~/components/debug/DebugRSC";
import { setLocaleIdServerContext } from "~/i18n/rsc-context";
interface SurveyPageServerProps {
  lang: string;
  slug: string;
  year: string;
}

export async function generateMetadata({
  params,
}: {
  params: SurveyPageServerProps;
}): Promise<Metadata | undefined> {
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  return undefined;
  // return await rscGetMetadata({ params });
}

/**
 * TODO: get the list of surveys statically during getStaticParams call
 * @param param0
 * @returns
 */
export default async function SurveyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string; year: string; lang: string };
}) {
  setLocaleIdServerContext(params.lang); // Needed for "ServerT"
  const { data: edition } = await rscMustGetSurveyEditionFromUrl(params);
  const {
    locale,
    localeId,
    error: localeError,
  } = await rscLocaleFromParams({
    lang: params.lang,
    contexts: [
      // TODO: we should have a shared layout between (mainLayout) pages and "survey/[slug]/[year]" that handle locales
      // so we don't have to reload commonContext translations in the surveys page
      ...getCommonContexts(),
      ...getSurveyContexts(edition.survey), ...getEditionContexts(edition)],
  });
  if (localeError) {
    throw new Error(`Can't load translations from API, error: ${JSON.stringify(localeError)}`)
  }
  // locales lists
  const {
    data: locales,
    ___metadata,
    error,
  } = (await rscAllLocalesMetadata()) || [];
  if (error) {
    return <div>{JSON.stringify(error, null, 2)}</div>;
  }

  return (
    <ClientLayout
      params={params}
      locales={locales}
      localeId={localeId}
      localeStrings={locale}
      addWrapper={false}
    >
      <EditionProvider
        edition={edition}
        editionPathSegments={[params.slug, params.year]}
        editionHomePath={getEditionHomePath({
          edition,
          locale: { id: localeId },
        })}
        surveySlug={params.slug}
        editionSlug={params.year}
      >
        <EditionLayout edition={edition}>{children}</EditionLayout>
      </EditionProvider>
    </ClientLayout>
  );
}
