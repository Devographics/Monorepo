import { captureException } from "@sentry/nextjs";
import { notFound } from "next/navigation";
import { EntitiesProvider } from "~/core/components/common/EntitiesContext";
import { fetchEntitiesRedis } from "~/core/server/fetchEntitiesRedis";
import { SurveyProvider } from "~/surveys/components/SurveyContext/Provider";
import { fetchSurvey } from "@devographics/core-models/server";
import {
  fetchLocaleStrings,
  getLocales,
  i18nCommonContexts,
} from "~/i18n/server/fetchLocalesRedis";
import { LocaleContextProvider } from "~/i18n/context/LocaleContext";

// revalidate survey/entities every 5 minutes
const SURVEY_TIMEOUT_SECONDS = 5 * 60;
export const revalidate = SURVEY_TIMEOUT_SECONDS;

// TODO: not yet compatible with having dynamic pages down the tree
// we may have to call generateStaticParams in each static page instead
// @see https://github.com/vercel/next.js/issues/44712
/*
export async function generateStaticParams() {
  return surveys.map((s) => ({
    slug: s.prettySlug,
    year: String(s.year),
  }));
}*/

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
  const { slug, year } = params;
  const survey = await fetchSurvey(slug, year);
  if (!survey) {
    notFound();
  }

  // survey specific strings
  const locale = params.lang; // getCurrentLocale();
  if (locale.includes(".")) {
    console.error(`Error: matched a file instead of a lang: ${locale}.
This is a bug in current Next.js version (13.0.4, november 2022). 
This means the file was not found,
but instead of sending a 404,
Next.js will fallback to trying to find a valid page path.
If this error still happens in a few months (2023) open an issue with repro at Next.js.`);
    notFound();
  }
  const i18nContexts = [
    // We expect the root layout to load the common contexts
    // and define a LocaleContextProvider
    // => generic strings and survey specific will be merged automatically
    //...i18nCommonContexts,
    // TODO: get this "survey context" value more reliably
    survey.prettySlug!.replace("-", "_"),
    survey.prettySlug!.replace("-", "_") + "_" + year,
  ];
  const localeWithStrings = await fetchLocaleStrings({
    localeId: locale,
    contexts: i18nContexts,
  });
  if (!localeWithStrings) {
    throw new Error(
      `Could not get locales for id ${locale} and context ${i18nContexts}`
    );
  }
  // locales lists
  const locales = (await getLocales()) || [];

  // NOTE: if fetch entities was based on survey slug
  // we could run those queries in //
  // (not useful in static mode though)
  let entities = [];
  try {
    const redisEntities = await fetchEntitiesRedis(survey.surveyId);
    if (!redisEntities) throw new Error("Entities not found in Redis");
    entities = redisEntities;
  } catch (err) {
    captureException(err);
  }

  // Apply survey colors
  const { colors } = survey;
  const style = `
:root {
  --bg-color: ${/*bgColor*/ colors.background};
  --text-color: ${/*textColor*/ colors.text};
  --link-color: ${/*linkColor*/ colors.primary};
  --hover-color: ${/*hoverColor*/ colors.secondary};
}
  `;

  return (
    <SurveyProvider survey={survey}>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <EntitiesProvider entities={entities}>
        <LocaleContextProvider
          locales={locales}
          localeId={locale}
          localeStrings={localeWithStrings}
        >
          {children}
        </LocaleContextProvider>
      </EntitiesProvider>
    </SurveyProvider>
  );
}
