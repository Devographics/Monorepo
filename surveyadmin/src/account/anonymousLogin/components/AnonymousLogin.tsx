// TODO: provide this component in Vulcan Next as well
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useState, ReactNode } from "react";
import { loginAnonymously } from "../lib";

export const AnonymousLoginForm = ({
  successRedirection,
  label = "Log In Anonymously",
}: {
  /** Path to redirect to on successful implementation */
  successRedirection?: string;
  label?: string | ReactNode;
}) => {
  const Components = useVulcanComponents();
  const [errorMsg, setErrorMsg] = useState("");

  async function loginAnonymouslyOnClick() {
    //e.preventDefault();
    try {
      if (errorMsg) setErrorMsg("");
      const res = await loginAnonymously();
      if (!res.ok) {
        setErrorMsg(await res.text());
      } else {
        // @see https://github.com/vercel/next.js/discussions/19601
        // This force SWR to update all queries subscribed to "user"
        if (successRedirection) {
          window.location.replace(successRedirection);
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setErrorMsg(error.message);
    }
  }

  return (
    <>
      <div className="anonymous-login">
        {/*<Form isLogin errorMessage={errorMsg} onSubmit={handleSubmit} />*/}
        <Components.Button onClick={() => loginAnonymouslyOnClick()}>
          {label}
        </Components.Button>
        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    </>
  );
};
