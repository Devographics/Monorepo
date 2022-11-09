// TODO: not working yet
// import "~/stylesheets/main.scss";
import { AppLayout } from "./AppLayout";
import { getLocaleStrings } from "~/i18n/server/fetchLocalesRedis";
//import debug from "debug";
const debugRootLayout = console.debug; //debug("dgs:rootlayout");

//*** I18n redirections
// @see https://nextjs.org/docs/advanced-features/i18n-routing
import { locales } from "~/i18n/data/locales";

export function generateStaticParams() {
  return locales.map((l) => ({ lang: l }));
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
  // FIXME: the [lang] parameter seems to sometime be vercel.svg, favicon.ico = static files
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
