import Surveys from "~/app/[lang]/Surveys";
import { fetchSurveysMetadata } from "~/lib/api/fetch";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";
import { cache } from "react";
import { locales } from "~/i18n/data/locales";

export function generateStaticParams() {
  return locales.map((l) => ({ lang: l }));
}

const rscFetchSurveysMetadata = cache(() =>
  fetchSurveysMetadata({ calledFrom: __filename })
);

const IndexPage = async ({ params }) => {
  initRedis(serverConfig().redisUrl);
  const surveys = await rscFetchSurveysMetadata();
  return <Surveys localeId={params.lang} surveys={surveys} />;
};

export default IndexPage;
