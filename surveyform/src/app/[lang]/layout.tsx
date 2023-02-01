// TODO: weird issue, Webpack scss rule is broken here
// if it still don't work just add a .scss loader manually
import "~/stylesheets/main.scss";
import { AppLayout } from "./AppLayout";
import {
  getLocales,
  fetchLocaleStrings,
  i18nCommonContexts,
} from "~/i18n/server/fetchLocalesRedis";
//import debug from "debug";
const debugRootLayout = console.debug; //debug("dgs:rootlayout");

//*** I18n redirections
// @see https://nextjs.org/docs/advanced-features/i18n-routing
//import { locales } from "~/i18n/data/locales";
import { notFound } from "next/navigation";

// TODO: not yet compatible with having dynamic pages down the tree
// we may have to call generateStaticParams in each static page instead
// @see https://github.com/vercel/next.js/issues/44712
// export function generateStaticParams() {
//   return locales.map((l) => ({ lang: l }));
// }

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}) {
  // locale fetching
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
  const localeWithStrings = await fetchLocaleStrings({
    localeId: locale,
    contexts: i18nCommonContexts,
  });
  if (!localeWithStrings) {
    throw new Error("Could not load locales of id: " + locale);
  }
  // locales lists
  const locales = (await getLocales()) || [];

  // TODO: we load waaaay too much strings
  // we should load survey specific strings in another nested layout
  //debugRootLayout("Got locale", locale, localeWithStrings);
  return (
    <html lang={params.lang}>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <AppLayout
          locales={locales}
          localeId={locale}
          localeStrings={localeWithStrings}
        >
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
