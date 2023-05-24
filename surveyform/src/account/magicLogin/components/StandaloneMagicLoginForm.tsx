"use client";

import { useState, ReactNode, FormEventHandler } from "react";
import { useIntlContext } from "@devographics/react-i18n";
import { sendMagicLoginEmail } from "~/account/magicLogin/client-actions/sendMagicLoginEmail";
import { useCurrentUser } from "~/lib/users/hooks";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { FormComponentEmail } from "./FormComponentEmail";
import { Button } from "~/components/ui/Button";

export interface StandaloneMagicLoginFormProps {
  label?: string | ReactNode;
  /**
   * Optional surveyId and editionId to login to a specific survey
   */
  surveyId?: string;
  editionId?: string;
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
}: StandaloneMagicLoginFormProps) => {
  const intl = useIntlContext();
  const placeholder = intl.formatMessage({ id: `accounts.your_email` });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const resetMessages = () => {
    if (errorMsg) setErrorMsg("");
    if (successMsg) setErrorMsg("");
  };
  const { currentUser } = useCurrentUser();
  const { locale } = useLocaleContext();

  async function handleSubmit(e) {
    e.preventDefault();
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
      const res = await sendMagicLoginEmail(body, window.location.pathname);
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
    }
  }
  return (
    <>
      <div className="login">
        <MagicLinkLoginForm
          errorMessage={errorMsg}
          successMessage={successMsg}
          onSubmit={handleSubmit}
          label={label}
          placeholder={placeholder}
        />
      </div>
    </>
  );
};

const MagicLinkLoginForm = ({
  errorMessage,
  successMessage,
  onSubmit,
  label = "Send me a magic link",
  placeholder,
}: {
  /** Path to redirect to on successful implementation */
  errorMessage?: string;
  successMessage?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  label?: string | ReactNode;
  placeholder?: string;
}) => {
  return (
    <form onSubmit={onSubmit} className="magic-link-login-form">
      <FormComponentEmail placeholder={placeholder} label={label} />
      <div className="submit">
        <Button type="submit">{label}</Button>
      </div>

      {errorMessage && <div className="error magic-error">{errorMessage}</div>}
      {successMessage && (
        <div className="success magic-success">{successMessage}</div>
      )}
    </form>
  );
};
