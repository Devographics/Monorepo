"use client";
import { useState, ReactNode } from "react";
import { useIntlContext } from "@devographics/react-i18n";
import { sendMagicLoginEmail } from "~/account/magicLogin/client-actions/sendMagicLoginEmail";
import { useCurrentUser } from "~/lib/users/hooks";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { FormComponentEmail } from "./FormComponentEmail";
import { Button } from "~/components/ui/Button";
import { Loading } from "~/components/ui/Loading";
import { LoadingButton } from "~/components/ui/LoadingButton";

export interface StandaloneMagicLoginFormProps {
  /** Button label */
  label?: string | ReactNode;
  /**
   * Optional surveyId and editionId to login to a specific survey
   */
  surveyId?: string;
  editionId?: string;
  successRedirectionPath?: string;
}
/**
 * With passwordless approach, there is no signup step,
 * and you provide only an email
 * @param param0
 * @returns
 */
export const StandaloneMagicLoginForm = ({
  label,
  surveyId,
  editionId,
  successRedirectionPath,
}: StandaloneMagicLoginFormProps) => {
  const intl = useIntlContext();
  const placeholder = intl.formatMessage({ id: `accounts.your_email` });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const resetMessages = () => {
    if (errorMsg) setErrorMsg("");
    if (successMsg) setErrorMsg("");
  };
  const { currentUser } = useCurrentUser();
  const { locale } = useLocaleContext();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    const email = e?.currentTarget?.email?.value;
    if (!email) {
      setErrorMsg(intl.formatMessage({ id: `accounts.magic_link.no_email` }));
      return;
    }
    localStorage && localStorage.setItem("email", email);
    const body = {
      destination: email,
      anonymousId: currentUser?._id,
      surveyId,
      editionId,
      locale: locale.id,
    };
    try {
      const res = await sendMagicLoginEmail(body, successRedirectionPath);
      if (res.status === 200) {
        setSuccessMsg(
          intl.formatMessage({ id: `accounts.magic_link.success` }) ||
            "Sent a magic link, check your mail inbox!"
        );
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={handleSubmit} className="magic-link-login-form">
      <FormComponentEmail placeholder={placeholder} label={placeholder} />
      <div className="submit">
        <LoadingButton type="submit" loading={loading}>
          {label}
        </LoadingButton>
      </div>
      {errorMsg && <div className="error magic-error">{errorMsg}</div>}
      {successMsg && <div className="success magic-success">{successMsg}</div>}
    </form>
  );
};
