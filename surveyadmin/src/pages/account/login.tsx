import Layout from "~/account/core/components/layout";
import LoginDialog from "~/account/LoginDialog";

const Login = () => {
  return (
    <Layout>
      <LoginDialog />
    </Layout>
  );
};

import { getLocaleStaticProps } from "~/i18n/server/ssr";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default Login;
