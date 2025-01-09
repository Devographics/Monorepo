// TODO:
// - reenable the API endoint
// - reenable outline markdown
import {
  fetchEditionMetadata,
  fetchSurveysMetadata,
} from "@devographics/fetch";
import { AdminExportPage } from "./components";

const AdminExportPageWithSurveys = async (
  props: {
    searchParams: Promise<{ surveyId: string; editionId: string }>;
  }
) => {
  const searchParams = await props.searchParams;
  // TODO: fetch survey data using shared code
  const res = await fetchSurveysMetadata({ calledFrom: "surveyadmin" });
  if (res.error) {
    return <p>Couldn't load surveys: ${res.error}</p>;
  }
  const surveys = res.data;

  const { surveyId, editionId } = searchParams;
  if (surveyId && editionId) {
    const res = await fetchEditionMetadata({
      surveyId,
      editionId,
      calledFrom: "surveyadmin",
    });
    return (
      <AdminExportPage
        surveys={surveys}
        edition={res.data}
        surveyId={surveyId}
        editionId={editionId}
      />
    );
  }
  return (
    <AdminExportPage
      surveys={surveys}
      surveyId={surveyId}
      editionId={editionId}
    />
  );
};
export default AdminExportPageWithSurveys;
