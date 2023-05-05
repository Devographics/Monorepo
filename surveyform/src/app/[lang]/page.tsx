import Surveys from "~/app/[lang]/Surveys";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";

const IndexPage = async () => {
  initRedis(serverConfig().redisUrl);
  const surveys = await fetchSurveysMetadata();
  console.log("SURVEYS", surveys);
  return <Surveys surveys={surveys} />;
};

export default IndexPage;
