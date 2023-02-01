import Surveys from "~/core/components/pages/Surveys";
import { fetchSurveysListGithub } from "@devographics/core-models/server";

const IndexPage = async () => {
  const surveys = await fetchSurveysListGithub();
  return <Surveys surveys={surveys} />;
};

export default IndexPage;
