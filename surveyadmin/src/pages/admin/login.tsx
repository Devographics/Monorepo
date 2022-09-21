import Layout from "~/account/core/components/layout";
import { StandaloneLoginForm } from "~/account/passwordLogin/components/StandaloneLoginForm";
import { useUser } from "~/account/user/hooks";

const Login = () => {
  useUser({ redirectTo: routes.admin.home.href, redirectIfFound: true });
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
