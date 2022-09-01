import { useUser } from "~/account/user/hooks";
import AdminStats from "~/admin/components/AdminStats";
import { routes } from "~/lib/routes";

export default function AdminStatsPage() {
  useUser({
    redirectTo: routes.account.login.href,
    rememberCurrentRoute: true,
    redirectIfNotAdmin: true,
  });
  return <AdminStats />;
}

import { getLocaleStaticProps } from "~/i18n/server/ssr";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}
