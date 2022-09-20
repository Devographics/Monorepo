// TODO: provide this component in Vulcan Next as well
import { useState, ReactNode, FormEventHandler } from "react";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useIntlContext } from "@vulcanjs/react-i18n";
import { sendMagicLoginEmail } from "../lib/sendMagicLoginEmail";
import { useUser } from "~/account/user/hooks";
import { useRouter } from "next/router";
import { useLocaleContext } from "~/i18n/components/LocaleContext";

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
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const resetMessages = () => {
    if (errorMsg) setErrorMsg("");
    if (successMsg) setErrorMsg("");
  };
  const { user } = useUser();
  const { getLocale } = useLocaleContext();

  const locale = getLocale();
  const { query } = router;

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
      prettySlug: query.slug,
      year: query.year,
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
}: {
  /** Path to redirect to on successful implementation */
  errorMessage?: string;
  successMessage?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  label?: string | ReactNode;
}) => {
  const Components = useVulcanComponents();
  return (
    <form onSubmit={onSubmit} className="magic-link-login-form">
      {/* <span>Your Email</span> */}
      <Components.FormComponentEmail
        inputProperties={{
          placeholder: "Your Email",
          name: "email",
          required: true,
          autoCorrect: "off",
          autoCapitalize: "none",
        }}
        label="Your Email"
        name="email"
      />
      <div className="submit">
        <Components.Button type="submit">{label}</Components.Button>
      </div>

      {errorMessage && <div className="error magic-error">{errorMessage}</div>}
      {successMessage && (
        <div className="success magic-success">{successMessage}</div>
      )}

      <style jsx>{`
        form,
        label {
          display: flex;
          flex-flow: column;
        }
        label > span {
          font-weight: 600;
        }
        /* input {
          padding: 8px;
          margin: 0.3rem 0 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        } */
        .submit {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          justify-content: space-between;
        }
        .submit > a {
          text-decoration: none;
        }
        .submit > button {
          padding: 0.5rem 1rem;
          cursor: pointer;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .submit > button:hover {
          border-color: #888;
        }
        .forgottenPassword {
          margin: 0 0rem 0.2rem;
        }
        .error {
          color: red;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
};
