import Surveys from "~/app/[lang]/Surveys";
import { fetchSurveysMetadata } from "~/lib/api/fetch";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";

const IndexPage = async ({ params }) => {
  initRedis(serverConfig().redisUrl);
  const surveys = await fetchSurveysMetadata({ calledFrom: "app/[lang]/page" });
  return <Surveys localeId={params.lang} surveys={surveys} />;
};

export default IndexPage;
