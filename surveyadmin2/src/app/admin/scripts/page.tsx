import AdminScripts from "~/components/AdminScripts";
import { getScripts } from "~/lib/scripts/actions";

export default async function AdminScriptsPage() {
  const scripts = await getScripts();
  return <AdminScripts scripts={scripts} />;
}
