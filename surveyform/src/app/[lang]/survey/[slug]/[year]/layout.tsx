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
  safeLocaleIdFromParams,
} from "~/i18n/config";
import { rscAllLocalesMetadata, rscLocale } from "~/lib/api/rsc-fetchers";
import { rscGetMetadata } from "~/lib/surveys/rsc-fetchers";
import { DebugRSC } from "~/components/debug/DebugRSC";
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
  return await rscGetMetadata({ params });
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
  const { data: edition } = await rscMustGetSurveyEditionFromUrl(params);
  // survey specific strings
  const localeId = safeLocaleIdFromParams(params);
  if (localeId.includes(".")) {
    console.error(`Error: matched a file instead of a lang: ${localeId}.
This is a bug in current Next.js version (13.0.4, november 2022). 
This means the file was not found,
but instead of sending a 404,
Next.js will fallback to trying to find a valid page path.
If this error still happens in a few months (2023) open an issue with repro at Next.js.`);
    notFound();
  }
  const i18nContexts = getEditionContexts({ edition });

  const {
    data: localeCommonContexts,
    ___metadata: ___rscLocale_CommonContexts,
  } = await rscLocale({
    localeId,
    contexts: getCommonContexts(),
  });

  const {
    data: localeEditionContexts,
    ___metadata: ___rscLocale_EditionContexts,
  } = await rscLocale({
    localeId,
    contexts: i18nContexts,
  });

  const localeAllContexts = {
    ...localeCommonContexts,
    strings: {
      ...localeCommonContexts.strings,
      ...localeEditionContexts.strings,
    },
  };

  if (!localeEditionContexts) {
    console.warn(
      `Could not get locales for id ${localeId} and context ${i18nContexts}`
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
      localeId={localeId}
      localeStrings={localeAllContexts}
      addWrapper={false}
    >
      <DebugRSC
        {...{ ___rscLocale_CommonContexts, ___rscLocale_EditionContexts }}
      />
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
