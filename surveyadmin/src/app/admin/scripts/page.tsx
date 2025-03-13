import { fetchSurveysMetadata } from "@devographics/fetch";
import AdminScripts from "~/components/AdminScripts";
import { getScripts } from "~/lib/scripts/actions";

export default async function AdminScriptsPage() {
  const scripts = await getScripts();
  const { data: surveys } = await fetchSurveysMetadata({
    addCredits: false,
  });

  return <AdminScripts scripts={scripts} surveys={surveys} />;
}
