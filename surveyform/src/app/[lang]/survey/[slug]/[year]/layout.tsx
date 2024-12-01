import type { Metadata } from "next";
// import { notFound } from "next/navigation";
import { EditionProvider } from "~/components/SurveyContext/Provider";

import { rscMustGetSurveyEditionFromUrl } from "./rsc-fetchers";
import ClientLayout from "~/app/[lang]/ClientLayout";
import EditionLayout from "~/components/common/EditionLayout";

import { getEditionHomePath } from "~/lib/surveys/helpers/getEditionHomePath";
import {
  getCommonContexts,
  getEditionContexts,
  getSurveyContexts,
} from "~/lib/i18n/config";
import {
  rscAllLocalesMetadata,
  rscLocaleFromParams,
} from "~/lib/i18n/api/rsc-fetchers";
import { rscGetMetadata } from "~/lib/surveys/rsc-fetchers";
import { DebugRSC } from "~/components/debug/DebugRSC";
interface SurveyPageServerProps {
  lang: string;
  slug: string;
  year: string;
}

export async function generateMetadata(
  props: {
    params: Promise<SurveyPageServerProps>;
  }
): Promise<Metadata | undefined> {
  const params = await props.params;
  return await rscGetMetadata({ params });
}

/**
 * TODO: get the list of surveys statically during getStaticParams call
 * @param param0
 * @returns
 */
export default async function SurveyLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ slug: string; year: string; lang: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const { data: edition } = await rscMustGetSurveyEditionFromUrl(params);
  const {
    locale,
    localeId,
    error: localeError,
  } = await rscLocaleFromParams({
    lang: params.lang,
    contexts: [
      // NOTE: 
      // we reload common contexts here because there is no parent layout,
      // context is not shared with (mainLayout pages) that are outside of the scope of a precise survey
      // we could have a shared layout between (mainLayout) and "survey/[slug]/[year]" that handle common locales
      // so we don't have to reload commonContext translations in the surveys page
      ...getCommonContexts(),
      ...getSurveyContexts(edition.survey),
      ...getEditionContexts(edition),
    ],
  });
  if (localeError) {
    console.log(localeError);
    throw new Error(
      `Can't load translations from API, error: ${JSON.stringify(localeError)}`
    );
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
