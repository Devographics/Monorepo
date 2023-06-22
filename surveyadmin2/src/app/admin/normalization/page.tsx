import AdminNormalization from "~/components/normalization/Normalization";
import { fetchSurveysMetadata } from "~/lib/api/fetch";

export default async function AdminNormalizationPage() {
  const surveys = await fetchSurveysMetadata();
  return <AdminNormalization surveys={surveys} />;
}
