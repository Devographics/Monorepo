import Surveys from "~/core/components/pages/Surveys";
import { fetchSurveysListGithub } from "~/modules/surveys/server/fetch";

const IndexPage = async () => {
  const surveys = await fetchSurveysListGithub();
  return <Surveys surveys={surveys} />;
};

export default IndexPage;
