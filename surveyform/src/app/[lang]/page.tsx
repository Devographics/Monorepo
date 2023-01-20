import Surveys from "~/core/components/pages/Surveys";
import { fetchSurveysList } from "~/surveys/list";
const IndexPage = async () => {
  const surveys = await fetchSurveysList();
  return <Surveys surveys={surveys} />;
};

export default IndexPage;
