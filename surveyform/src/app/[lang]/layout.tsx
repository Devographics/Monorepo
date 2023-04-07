import { AppLayout } from "./AppLayout";
import { getLocales } from "~/i18n/server/fetchLocalesRedis";

//*** I18n redirections
// @see https://nextjs.org/docs/advanced-features/i18n-routing
//import { locales } from "~/i18n/data/locales";
import { initRedis } from "@devographics/core-models/server";
import { serverConfig } from "~/config/server";
import { Metadata } from "next";
import { mustFetchLocale } from "./fetchers";

// TODO: not yet compatible with having dynamic pages down the tree
// we may have to call generateStaticParams in each static page instead
// @see https://github.com/vercel/next.js/issues/44712
// export function generateStaticParams() {
//   return locales.map((l) => ({ lang: l }));
// }

export const metadata: Metadata = {
  title: "Devographics Surveys",
  description: "State of JavaScript, CSS, GraphQL and friends",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  // /app/favicon.ico is automatically used as icon
};

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
  const loc = await mustFetchLocale(params);
  if (!loc) return <></>;
  const { localeWithStrings, localeId } = loc;

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
          localeId={localeId}
          localeStrings={localeWithStrings}
        >
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
