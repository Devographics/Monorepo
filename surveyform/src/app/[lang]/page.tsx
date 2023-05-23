import Surveys from "~/app/[lang]/Surveys";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";
import { getSurveyParamsTable } from "~/lib/surveys/data";

const IndexPage = async ({ params }) => {
  initRedis(serverConfig().redisUrl);
  const surveys = await fetchSurveysMetadata({ calledFrom: "app/[lang]/page" });
  const surveyParamsTable = getSurveyParamsTable();
  return (
    <Surveys
      localeId={params.localeId}
      surveys={surveys}
      surveyParamsTable={surveyParamsTable}
    />
  );
};

export default IndexPage;
