"use client";
import { useState, ReactNode } from "react";
import { sendMagicLoginEmail } from "~/account/magicLogin/client-actions/sendMagicLoginEmail";
import { useCurrentUser } from "~/lib/users/hooks";
import { FormComponentEmail } from "./FormComponentEmail";
import { LoadingButton } from "~/components/ui/LoadingButton";
import { T, useI18n } from "@devographics/react-i18n";

const GmailMessage = ({
  domain,
}: {
  /** NOTE: it must match the domain used for emails, otherwise the search will fail! */
  domain: string;
}) => {
  // will look in spams too
  const link = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(
    `from:${domain}+OR+from:stateofjs+OR+from:devographics+in:anywhere`,
  )}`;
  return <T token="accounts.magic_link.browser" values={{ link }} />;
};

export interface StandaloneMagicLoginFormProps {
  /** Button label */
  label?: string | ReactNode;
  /**
   * Optional surveyId and editionId to login to a specific survey
   */
  surveyId?: string;
  editionId?: string;
  redirectTo?: string;
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
  redirectTo,
}: StandaloneMagicLoginFormProps) => {
  const { t, locale } = useI18n()
  const placeholder = t(`accounts.your_email`)
  const [errorMsg, setErrorMsg] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const resetMessages = () => {
    if (errorMsg) setErrorMsg("");
    if (successEmail) setErrorMsg("");
  };
  const { currentUser } = useCurrentUser();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    const email = e?.currentTarget?.email?.value;
    if (!email) {
      setErrorMsg(
        t(`accounts.magic_link.no_email`),
      );
      return;
    }
    localStorage && localStorage.setItem("email", email);
    const body = {
      destination: email,
      anonymousId: currentUser?._id,
      redirectTo,
      surveyId,
      editionId,
      locale: locale.id,
    };
    try {
      const res = await sendMagicLoginEmail({ body });
      if (res.status === 200) {
        setSuccessEmail(email);
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
      {successEmail && (
        <div className="success magic-success">
          <T token="accounts.magic_link.success" />
          {surveyId && successEmail.match("gmail.com") && (
            <>
              {" "}
              <GmailMessage
                domain={surveyId.replaceAll("_", "").toLowerCase()}
              />
            </>
          )}
        </div>
      )}
    </form>
  );
};
