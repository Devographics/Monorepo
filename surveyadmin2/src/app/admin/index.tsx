import React from "react";
import { useUser } from "~/account/user/hooks";
import { PageLayout } from "~/core/components/layout";
import { routes } from "~/lib/routes";
import Link from "next/link";

const AdminPage = () => {
  // TODO: this is an authenticated page, but we also would like to check the role
  useUser({
    redirectTo: routes.admin.login.href,
    rememberCurrentRoute: true,
    redirectIfNotAdmin: true,
  });
  return (
    <PageLayout>
      <h1>Admin area</h1>
      <div>
        <Link href="/admin/stats">Admin stats</Link>
      </div>
      <div>
        <Link href="/admin/normalization">Normalize</Link>
      </div>
      <div>
        <Link href={routes.admin.scripts.href}>Scripts</Link>
      </div>
      <div>
        <Link href={routes.admin.export.href}>Export normalized responses</Link>
      </div>
    </PageLayout>
  );
};

import { getLocaleStaticProps } from "~/i18n/server/ssr";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default AdminPage;
