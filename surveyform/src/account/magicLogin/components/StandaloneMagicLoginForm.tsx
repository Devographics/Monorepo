"use client";

import { useState, ReactNode, FormEventHandler } from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { sendMagicLoginEmail } from "../lib/sendMagicLoginEmail";
import { useUser } from "~/account/user/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocaleContext } from "~/i18n/components/LocaleContext";
import { FormComponentEmail } from "./FormComponentEmail";

/**
 * With passwordless approach, there is no signup step,
 * and you provide only an email
 * @param param0
 * @returns
 */
export const StandaloneMagicLoginForm = ({
  label,
}: {
  label?: string | ReactNode;
}) => {
  const router = useRouter();
  const intl = useIntlContext();
  const placeholder = intl.formatMessage({ id: `accounts.your_email` });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const resetMessages = () => {
    if (errorMsg) setErrorMsg("");
    if (successMsg) setErrorMsg("");
  };
  const { user } = useUser();
  const { getLocale } = useLocaleContext();

  const locale = getLocale();
  const params = useSearchParams();

  if (process.env.NEXT_PUBLIC_IS_USING_DEMO_DATABASE)
    return (
      <p>
        CAN'T LOGIN you are using Vulcan Next demo database, please set
        MONGO_URI env variable to your own database.
      </p>
    );

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
      // no need to wait for current user loading, because it's normally always faster than typing one's email and submitting
      anonymousId: user?._id,
      prettySlug: params.get("slug"),
      year: params.get("year"),
      locale,
    };

    try {
      const res = await sendMagicLoginEmail(body);
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
  const Components = useVulcanComponents();

  return (
    <form onSubmit={onSubmit} className="magic-link-login-form">
      {/* <span>Your Email</span> */}
      <FormComponentEmail
        inputProperties={{
          placeholder,
          name: "email",
          required: true,
          autoCorrect: "off",
          autoCapitalize: "none",
        }}
        label={placeholder}
        name="email"
      />
      <div className="submit">
        <Components.Button type="submit">{label}</Components.Button>
      </div>

      {errorMessage && <div className="error magic-error">{errorMessage}</div>}
      {successMessage && (
        <div className="success magic-success">{successMessage}</div>
      )}
    </form>
  );
};
