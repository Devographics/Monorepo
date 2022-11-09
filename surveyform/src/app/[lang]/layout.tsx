// TODO: not working yet
// import "~/stylesheets/main.scss";
import { AppLayout } from "./AppLayout";
import { getLocaleStrings } from "~/i18n/server/fetchLocalesRedis";
//import debug from "debug";
const debugRootLayout = console.debug; //debug("dgs:rootlayout");

//*** I18n redirections
// @see https://nextjs.org/docs/advanced-features/i18n-routing
import { locales } from "~/i18n/data/locales";
const localeIds = locales.map((l) => l.id);
const countryIds = localeIds.map((l) => l.slice(0, 2));
const uniqueLocales = [...new Set([...localeIds, ...countryIds]).values()];

export function generateStaticParams() {
  return uniqueLocales.map((l) => ({ lang: l }));
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
  const locale = params.lang; // getCurrentLocale();
  const localeWithStrings = locale ? await getLocaleStrings(locale) : undefined;
  debugRootLayout("Got locale", locale, localeWithStrings);
  return (
    <html lang={params.lang}>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <AppLayout locale={locale} localeStrings={localeWithStrings}>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
