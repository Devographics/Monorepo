"use client";
import { useRouter } from "next/navigation";
import { useState, ReactNode } from "react";
import { loginAnonymously } from "../lib";
import { useSWRConfig } from "swr";
import { apiRoutes } from "~/lib/apiRoutes";
import { Button } from "~/components/ui/Button";

/**
 * Will update all "useUser" hooks
 */
const useRefreshUser = () => {
  const { mutate } = useSWRConfig();
  return async function refreshUser() {
    // NOTE: this step is very important,
    // it updates "useUser" hook so user is connected
    await mutate(apiRoutes.account.user.href);
  };
};

export const AnonymousLoginForm = ({
  successRedirection,
  label = "Log In Anonymously",
}: {
  /** Path to redirect to on successful implementation */
  successRedirection?: string;
  label?: string | ReactNode;
}) => {
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const refreshUser = useRefreshUser();

  async function loginAnonymouslyOnClick() {
    try {
      if (errorMsg) setErrorMsg("");
      const res = await loginAnonymously();
      if (!res.ok) {
        setErrorMsg(await res.text());
      } else {
        await refreshUser();
        if (successRedirection) {
          console.log("push to", successRedirection);
          router.push(successRedirection);
        }
        // will reload the user in the RSC
        router.refresh();
      }
    } catch (error: any) {
      console.error("An unexpected error occurred:", error);
      setErrorMsg(error.message);
    }
  }

  return (
    <>
      <div className="anonymous-login">
        {/*<Form isLogin errorMessage={errorMsg} onSubmit={handleSubmit} />*/}
        <Button onClick={() => loginAnonymouslyOnClick()}>{label}</Button>
        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    </>
  );
};
