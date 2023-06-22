import { useUser } from "~/account/user/hooks";
import AdminScripts from "~/components/AdminScripts";
import { routes } from "~/lib/routes";

export default function AdminScriptsPage() {
  useUser({
    redirectTo: routes.account.login.href,
    rememberCurrentRoute: true,
    redirectIfNotAdmin: true,
  });
  return <AdminScripts />;
}

import { getLocaleStaticProps } from "~/i18n/server/ssr";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}
