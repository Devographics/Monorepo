import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditionProvider } from "~/components/SurveyContext/Provider";

import { rscMustGetSurveyEdition } from "./rsc-fetchers";
import AppLayout from "~/app/[lang]/AppLayout";
import EditionLayout from "~/components/common/EditionLayout";

const cachedGetLocales = cache(fetchAllLocalesMetadata);

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

import { getSurveyImageUrl } from "~/lib/surveys/helpers";
import { publicConfig } from "~/config/public";
import { getEditionHomePath, getEditionTitle } from "~/lib/surveys/helpers";
import { cache } from "react";
import { fetchAllLocalesMetadata, fetchLocaleCached } from "~/lib/api/fetch";
import {
  getCommonContexts,
  getEditionContexts,
  getLocaleIdFromParams,
} from "~/i18n/config";
interface SurveyPageServerProps {
  slug: string;
  year: string;
}

export async function generateMetadata({
  params: { slug, year },
}: {
  params: SurveyPageServerProps;
}): Promise<Metadata> {
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  const edition = await rscMustGetSurveyEdition({ slug, year });
  const { socialImageUrl, faviconUrl } = edition;
  const imageUrl = getSurveyImageUrl(edition);
  let imageAbsoluteUrl = socialImageUrl || imageUrl;
  const url = publicConfig.appUrl;

  const meta: Metadata = {
    title: getEditionTitle({ edition }),
    // NOTE: merge between route segments is shallow, you may need to repeat field from layout
    openGraph: {
      // @ts-ignore
      type: "article" as const,
      url,
      images: imageAbsoluteUrl,
    },
    twitter: {
      // @ts-ignore
      card: "summary" as const,
      images: imageAbsoluteUrl,
    },
    alternates: {
      canonical: url,
      // we could create alternates for languages too
    },
  };
  if (faviconUrl) {
    meta.icons = {
      icon: faviconUrl,
      shortcut: faviconUrl,
    };
  }
  return meta;
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
  const edition = await rscMustGetSurveyEdition(params);
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

  const localeCommonContexts = await fetchLocaleCached({
    localeId,
    contexts: getCommonContexts(),
  });

  const localeEditionContexts = await fetchLocaleCached({
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
  const locales = (await cachedGetLocales()) || [];

  // Apply survey colors
  const { colors } = edition;
  const style = `
:root {
  --bg-color: ${/*bgColor*/ colors.background};
  --text-color: ${/*textColor*/ colors.text};
  --link-color: ${/*linkColor*/ colors.primary};
  /*--hover-color: ${/*hoverColor*/ colors.secondary};*/
  --hover-color: white;
}
  `;

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
        <style dangerouslySetInnerHTML={{ __html: style }} />
        <EditionLayout edition={edition}>{children}</EditionLayout>
      </EditionProvider>
    </AppLayout>
  );
}
