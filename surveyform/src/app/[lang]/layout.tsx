//const BREAK; // TODO: current build is broken,
// so this prevents new deploy until I test it out next week

// TODO: weird issue, Webpack scss rule is broken here
// if it still don't work just add a .scss loader manually
import "~/stylesheets/main.scss";
import { AppLayout } from "./AppLayout";
import {
  getLocales,
  fetchLocaleStrings,
  i18nCommonContexts,
} from "~/i18n/server/fetchLocalesRedis";

//*** I18n redirections
// @see https://nextjs.org/docs/advanced-features/i18n-routing
//import { locales } from "~/i18n/data/locales";
import { notFound } from "next/navigation";
import { initRedis } from "@devographics/core-models/server";
import { serverConfig } from "~/config/server";

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
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  initRedis(serverConfig().redisUrl);
  // locale fetching
  const locale = params.lang; // getCurrentLocale();
  if (locale.includes(".")) {
    console.warn(
      `Error: matched a file instead of a lang: ${locale}. This happens when the file is not found.`
    );
    notFound();
  }
  if (locale === "[lang]" || locale === "%5Blang%5D") {
    console.warn(
      "Trying to render with param lang literally set to '[lang]'." +
        "This issue has appeared in Next 13.1.0+ (fev 2023)."
    );
    return <></>;
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
