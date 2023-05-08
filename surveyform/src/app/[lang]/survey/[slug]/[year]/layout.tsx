import type { Metadata } from "next";
import { captureException } from "@sentry/nextjs";
import { notFound } from "next/navigation";
import { EntitiesProvider } from "~/core/components/common/EntitiesContext";
import { fetchEntitiesRedis } from "~/core/server/fetchEntitiesRedis";
import { EditionProvider } from "~/surveys/components/SurveyContext/Provider";
import { initRedis } from "@devographics/redis";

import { LocaleContextProvider } from "~/i18n/context/LocaleContext";
import { serverConfig } from "~/config/server";
import { mustGetSurveyEdition } from "./fetchers";

const cachedGetLocales = cache(getLocales);

// revalidate survey/entities every 5 minutes
const SURVEY_TIMEOUT_SECONDS = 5 * 60;
export const revalidate = SURVEY_TIMEOUT_SECONDS;

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

import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";
import { publicConfig } from "~/config/public";
import { getEditionHomePath, getEditionTitle } from "~/surveys/helpers";
import { cachedFetchLocaleStrings } from "~/app/[lang]/fetchers";
import { cache } from "react";
import { getLocales } from "~/i18n/server/fetchLocalesRedis";
import { getSurveyParamsTable } from "~/surveys/data";
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
  initRedis(serverConfig().redisUrl);
  const edition = await mustGetSurveyEdition({ slug, year });
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
      image: imageAbsoluteUrl,
    },
    twitter: {
      // @ts-ignore
      card: "summary" as const,
      image: imageAbsoluteUrl,
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
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  initRedis(serverConfig().redisUrl);

  const edition = await mustGetSurveyEdition(params);
  const surveyParamsTable = await getSurveyParamsTable();
  // survey specific strings
  const localeId = params.lang;
  if (localeId.includes(".")) {
    console.error(`Error: matched a file instead of a lang: ${localeId}.
This is a bug in current Next.js version (13.0.4, november 2022). 
This means the file was not found,
but instead of sending a 404,
Next.js will fallback to trying to find a valid page path.
If this error still happens in a few months (2023) open an issue with repro at Next.js.`);
    notFound();
  }
  const localeSlug = edition.surveyId;
  console.log("// localeSlug");
  console.log(edition.surveyId);
  // NOTE: the demo survey was previously using the graphql contexts ["state_of_graphql", "state_of_graphql_2022"]
  // now it has its own strings
  const i18nContexts = [
    // We expect the root layout to load the common contexts
    // and define a LocaleContextProvider
    // => generic strings and survey specific will be merged automatically
    //...i18nCommonContexts,
    localeSlug,
    localeSlug + "_" + params.year,
  ];
  const localeWithStrings = await cachedFetchLocaleStrings(
    localeId,
    ...i18nContexts
  );
  if (!localeWithStrings) {
    console.warn(
      `Could not get locales for id ${localeId} and context ${i18nContexts}`
    );
  }
  // locales lists
  const locales = (await cachedGetLocales()) || [];

  // NOTE: if fetch entities was based on survey slug
  // we could run those queries in //
  // (not useful in static mode though)
  let entities = [];
  try {
    console.log("edition", edition.surveyId);
    const redisEntities = await fetchEntitiesRedis(edition.surveyId); //.editionId);
    if (!redisEntities) throw new Error("Entities not found in Redis");
    entities = redisEntities;
  } catch (err) {
    captureException(err);
  }

  // Apply survey colors
  const { colors } = edition;
  const style = `
:root {
  --bg-color: ${/*bgColor*/ colors.background};
  --text-color: ${/*textColor*/ colors.text};
  --link-color: ${/*linkColor*/ colors.primary};
  --hover-color: ${/*hoverColor*/ colors.secondary};
}
  `;

  return (
    <EditionProvider
      edition={edition}
      editionPathSegments={[params.slug, params.year]}
      editionHomePath={getEditionHomePath(edition, surveyParamsTable)}
      surveySlug={params.slug}
      editionSlug={params.year}
    >
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <EntitiesProvider entities={entities}>
        <LocaleContextProvider
          locales={locales}
          localeId={localeId}
          localeStrings={localeWithStrings || { id: "NOT_FOUND", strings: {} }}
          contexts={i18nContexts}
        >
          {children}
        </LocaleContextProvider>
      </EntitiesProvider>
    </EditionProvider>
  );
}
