import Surveys from "~/app/[lang]/Surveys";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";

import { rscFetchSurveysMetadata } from "~/lib/surveys/rsc-fetchers";

import { locales } from "~/i18n/data/locales";
export function generateStaticParams() {
  return locales.map((l) => ({ lang: l }));
}

const IndexPage = async ({ params }) => {
  initRedis(serverConfig().redisUrl);
  const surveys = await rscFetchSurveysMetadata();
  return <Surveys localeId={params.lang} surveys={surveys} />;
};

export default IndexPage;
