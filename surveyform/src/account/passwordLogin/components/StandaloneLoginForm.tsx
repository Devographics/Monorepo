// TODO: provide this component in Vulcan Next as well
import { useState } from "react";
import Form from "~/account/passwordLogin/components/form";
import { apiRoutes } from "~/lib/apiRoutes";
export const StandaloneLoginForm = ({
  successRedirection,
}: {
  /** Path to redirect to on successful implementation */
  successRedirection?: string;
}) => {
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (errorMsg) setErrorMsg("");

    const body = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };

    try {
      const res = await fetch(apiRoutes.account.login.href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        // @see https://github.com/vercel/next.js/discussions/19601
        // This force SWR to update all queries subscribed to "user"
        if (successRedirection) {
          window.location.replace(successRedirection);
        } else {
          window.location.reload();
        }
        // Router.push("/");
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setErrorMsg(error.message);
    }
  }

  if (process.env.NEXT_PUBLIC_IS_USING_DEMO_DATABASE)
    return (
      <p>
        CAN'T LOGIN you are using Vulcan Next demo database, please set
        MONGO_URI env variable to your own database.
      </p>
    );
  return (
    <>
      <div className="login">
        <Form isLogin errorMessage={errorMsg} onSubmit={handleSubmit} />
      </div>
      <style jsx>{`
        .login {
          max-width: 21rem;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};
