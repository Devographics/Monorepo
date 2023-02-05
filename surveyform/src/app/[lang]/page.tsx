import Surveys from "~/core/components/pages/Surveys";
import { fetchSurveysList } from "@devographics/core-models/server";

const IndexPage = async () => {
  const surveys = await fetchSurveysList();
  return <Surveys surveys={surveys} />;
};

export default IndexPage;
