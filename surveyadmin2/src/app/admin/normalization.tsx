import { useUser } from "~/account/user/hooks";
import AdminNormalization from "~/components/normalization/Normalization";
import { routes } from "~/lib/routes";

export default function AdminNormalizationPage() {
  useUser({
    redirectTo: routes.account.login.href,
    rememberCurrentRoute: true,
    redirectIfNotAdmin: true,
  });
  return <AdminNormalization />;
}

import { getLocaleStaticProps } from "~/i18n/server/ssr";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}
