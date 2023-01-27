import Surveys from "~/core/components/pages/Surveys";
import { fetchSurveysListGithub } from "~/surveys/server/fetch";

const IndexPage = async () => {
  const surveys = await fetchSurveysListGithub();
  return <Surveys surveys={surveys} />;
};

export default IndexPage;
