import { useState } from "react";
import { useUser } from "~/account/user/hooks";
import Layout from "~/account/core/components/layout";
import UserForm from "~/account/passwordLogin/components/form";
import { routes } from "~/lib/routes";
import { useRouter } from "next/router.js";
import { apiRoutes } from "~/lib/apiRoutes";
const Signup = () => {
  return <p>Password based signup is disabled. Just login with your email.</p>;
  const router = useRouter();
  useUser({ redirectTo: "/", redirectIfFound: true });

  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (errorMsg) setErrorMsg("");

    const body = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };

    if (body.password !== e.currentTarget.rpassword.value) {
      setErrorMsg(`The passwords don't match`);
      return;
    }

    try {
      const res = await fetch(apiRoutes.account.signup.href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        router.push(routes.account.verifyEmail.href);
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      console.error("An unexpected error happened occurred:", error);
      setErrorMsg(error.message);
    }
  }

  return (
    <Layout>
      <div className="signup">
        <UserForm
          isLogin={false}
          errorMessage={errorMsg}
          onSubmit={handleSubmit}
        />
      </div>
      <style jsx>{`
        .signup {
          max-width: 21rem;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </Layout>
  );
};

import { getLocaleStaticProps } from "~/i18n/server/ssr";
export async function getStaticProps(ctx) {
  return getLocaleStaticProps(ctx);
}
export default Signup;
