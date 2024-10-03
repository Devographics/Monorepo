"use client";
import { useRouter } from "next/navigation";
import { useState, ReactNode } from "react";
import { loginAnonymously } from "../lib";
import { useSWRConfig } from "swr";
import { apiRoutes } from "~/lib/apiRoutes";
import { LoadingButton } from "~/components/ui/LoadingButton";
import { ResponseDocument } from "@devographics/types";

/**
 * Will update all "useUser" hooks
 */
const useRefreshUser = () => {
  const { mutate } = useSWRConfig();
  return async function refreshUser() {
    // NOTE: this step is very important,
    // it updates "useUser" hook so user is connected
    await mutate(apiRoutes.account.currentUser.href);
  };
};

export const AnonymousLoginForm = ({
  successRedirectionPath,
  successRedirectionFunction,
  label = "Log In Anonymously",
  loginOptions,
}: {
  successRedirectionPath?: string;
  successRedirectionFunction?: (res: ResponseDocument) => string;
  label?: string | ReactNode;
  loginOptions?: { data?: any; createResponse?: boolean };
}) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const refreshUser = useRefreshUser();

  async function loginAnonymouslyOnClick() {
    setLoading(true);
    try {
      if (errorMsg) setErrorMsg("");
      const res = await loginAnonymously(loginOptions);
      if (!res.ok) {
        setErrorMsg(await res.text());
      } else {
        const result = await res.json();
        await refreshUser();
        if (successRedirectionFunction) {
          const path = successRedirectionFunction(result);
          router.push(path);
        } else if (successRedirectionPath) {
          router.push(successRedirectionPath);
        }
        // will reload the user in the RSC
        router.refresh();
        setLoading(false);
      }
    } catch (error: any) {
      console.error("An unexpected error occurred:", error);
      setErrorMsg(error.message);
      setLoading(false);
    }
  }

  return (
    <>
      <div className="anonymous-login">
        <LoadingButton
          onClick={() => loginAnonymouslyOnClick()}
          loading={loading}
        >
          {label}
        </LoadingButton>
        {errorMsg && (
          <p className="error survey-message survey-error login-error">
            {errorMsg}
          </p>
        )}
      </div>
    </>
  );
};
