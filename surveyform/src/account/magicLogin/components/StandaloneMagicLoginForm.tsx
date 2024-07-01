"use client";
import { useState, ReactNode } from "react";
import { useIntlContext } from "@devographics/react-i18n-legacy";
import { sendMagicLoginEmail } from "~/account/magicLogin/client-actions/sendMagicLoginEmail";
import { useCurrentUser } from "~/lib/users/hooks";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { FormComponentEmail } from "./FormComponentEmail";
import { LoadingButton } from "~/components/ui/LoadingButton";
import { teapot } from "@devographics/react-i18n";
import { tokens } from "./StandaloneMagicLoginForm.tokens";

const { T } = teapot(tokens);

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
  const intl = useIntlContext();
  const placeholder = intl.formatMessage({ id: `accounts.your_email` })?.t;
  const [errorMsg, setErrorMsg] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const resetMessages = () => {
    if (errorMsg) setErrorMsg("");
    if (successEmail) setErrorMsg("");
  };
  const { currentUser } = useCurrentUser();
  const { locale } = useLocaleContext();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    const email = e?.currentTarget?.email?.value;
    if (!email) {
      setErrorMsg(
        intl.formatMessage({ id: `accounts.magic_link.no_email` })?.t,
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
