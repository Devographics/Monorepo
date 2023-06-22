import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "~/account/core/components/layout";
import { StandaloneLoginForm } from "~/account/passwordLogin/components/StandaloneLoginForm";
import { LogoutButton } from "~/account/user/components";
import { useUser } from "~/account/user/hooks";

const Login = () => {
  const { user, loading, error } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user?.isAdmin) {
      router.push(routes.admin.home.href);
    }
  }, [loading, !!error, user?.isAdmin]);
  if (!!user && !user?.isAdmin) {
    return (
      <Layout>
        <div>
          <h2>Logged in as non-admin user</h2>
          <p>Please log out first</p>
          <LogoutButton />
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <StandaloneLoginForm successRedirection="/admin" />
    </Layout>
  );
};

import { getLocaleStaticProps } from "~/i18n/server/ssr";
import { routes } from "~/lib/routes";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default Login;
