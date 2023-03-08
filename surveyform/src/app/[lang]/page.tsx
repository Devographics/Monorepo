import Surveys from "~/core/components/pages/Surveys";
import { fetchSurveysList, initRedis } from "@devographics/core-models/server";
import { serverConfig } from "~/config/server";

const IndexPage = async () => {
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  initRedis(serverConfig().redisUrl);
  const isDevOrTest = serverConfig().isDev || serverConfig().isTest;
  const surveys = await fetchSurveysList(isDevOrTest);
  return <Surveys surveys={surveys} />;
};

export default IndexPage;
