import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditionProvider } from "~/components/SurveyContext/Provider";

import {
  rscGetSurveyEditionFromUrl,
  rscMustGetSurveyEditionFromUrl,
} from "./rsc-fetchers";
import AppLayout from "~/app/[lang]/AppLayout";
import EditionLayout from "~/components/common/EditionLayout";

// TODO: not yet compatible with having dynamic pages down the tree
// we may have to call generateStaticParams in each static page instead
// @see https://github.com/vercel/next.js/issues/44712
/*
export async function generateStaticParams() {
  return surveys.map((s) => ({
    slug: s.surveyId.replaceAll("_", "-"),
    year: String(s.year),
  }));
}*/

import { getMetadata, getSurveyImageUrl } from "~/lib/surveys/helpers";
import { publicConfig } from "~/config/public";
import { getEditionHomePath } from "~/lib/surveys/helpers";
import {
  getCommonContexts,
  getEditionContexts,
  getLocaleIdFromParams,
} from "~/i18n/config";
import { rscAllLocalesMetadata, rscLocale } from "~/lib/api/rsc-fetchers";
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
  return await getMetadata({ params });
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
  const edition = await rscMustGetSurveyEditionFromUrl(params);
  // survey specific strings
  const localeId = getLocaleIdFromParams(params);
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

  const localeCommonContexts = await rscLocale({
    localeId,
    contexts: getCommonContexts(),
  });

  const localeEditionContexts = await rscLocale({
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
  const locales = (await rscAllLocalesMetadata()) || [];

  return (
    <AppLayout
      params={params}
      locales={locales}
      localeId={localeId}
      localeStrings={localeAllContexts}
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
    </AppLayout>
  );
}
