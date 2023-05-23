import Surveys from "~/app/[lang]/Surveys";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";
import { getSurveyParamsTable } from "~/lib/surveys/data";

const IndexPage = async () => {
  initRedis(serverConfig().redisUrl);
  const surveys = await fetchSurveysMetadata({ calledFrom: "app/[lang]/page" });
  const surveyParamsTable = getSurveyParamsTable();
  return <Surveys surveys={surveys} surveyParamsTable={surveyParamsTable} />;
};

export default IndexPage;
