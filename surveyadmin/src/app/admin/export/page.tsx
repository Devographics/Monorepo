// TODO:
// - reenable the API endoint
// - reenable outline markdown
import { fetchSurveysMetadata } from "@devographics/fetch";
import { AdminExportPage } from "./components";

const AdminExportPageWithSurveys = async () => {
  // TODO: fetch survey data using shared code
  const res = await fetchSurveysMetadata();
  if (res.error) {
    return <p>Couldn't load surveys: ${res.error}</p>;
  }
  const surveys = res.data;
  return <AdminExportPage surveys={surveys} />;
};
export default AdminExportPageWithSurveys;
