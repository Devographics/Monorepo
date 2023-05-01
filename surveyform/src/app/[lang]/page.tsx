import Surveys from "~/app/[lang]/Surveys";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";

const IndexPage = async () => {
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  initRedis(serverConfig().redisUrl);
  const isDevOrTest = serverConfig().isDev || serverConfig().isTest;
  const surveys = await fetchSurveysMetadata({ isDevOrTest });
  return <Surveys surveys={surveys} />;
};

export default IndexPage;
