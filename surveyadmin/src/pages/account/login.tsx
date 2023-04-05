import Layout from "~/account/core/components/layout";
// import LoginDialog from "~/account/LoginDialog";
import { StandaloneLoginForm } from "~/account/passwordLogin/components/StandaloneLoginForm";

const Login = () => {
  return (
    <Layout>
      <StandaloneLoginForm successRedirection="/admin" />
      {/* <LoginDialog /> */}
    </Layout>
  );
};

import { getLocaleStaticProps } from "~/i18n/server/ssr";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}

export default Login;
