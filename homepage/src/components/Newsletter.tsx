import React, { useState } from "react";
// import { useI18n } from '../helpers/i18nContext'
import "../stylesheets/_newsletter.scss";
import T from "./T";

import { getStringTranslator, Locale } from "../helpers/translator";

export default function Newsletter({ submitUrl, locale }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // const i18n = useI18n()

  const handleChange = (e) => {
    const email = e.target.value;
    setEmail(email);
  };

  const handleSubmit = async (e) => {
    setLoading(true);

    console.log("SUBMITTING");

    e.preventDefault();
    const response = await fetch(submitUrl, {
      method: "POST",
      body: `field_0=${encodeURIComponent(email)}`,
      headers: {
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
    const result = await response.json();
    const { error, message } = result;

    setLoading(false);

    if (error) {
      setError(error);
      setSuccess(null);
    } else {
      setError(null);
      setSuccess({ message });
    }
  };

  return (
    <div className="newsletter">
      <h3 className="newsletter-heading">
        <T locale={locale} k="newsletter.stay_tuned" />
      </h3>
      <p className="newsletter-details">
        <T locale={locale} k="newsletter.leave_your_email" />
      </p>{" "}
      {error && (
        <div className="newsletter-message newsletter-error">
          {error.message}
        </div>
      )}
      {success ? (
        <div className="newsletter-message newsletter-success">
          {success.message}
        </div>
      ) : (
        <NewsletterForm
          email={email}
          loading={loading}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          locale={locale}
          submitUrl={submitUrl}
        />
      )}
    </div>
  );
}

const NewsletterForm = ({
  email,
  loading,
  handleSubmit,
  handleChange,
  submitUrl,
  locale,
}) => {
  // const { getString } = useI18n()
  const getString = getStringTranslator(locale);

  return (
    <div className="newsletter-form">
      <form method="post" action={submitUrl} onSubmit={handleSubmit}>
        <input
          className="newsletter-email"
          id="field_0"
          name="field_0"
          type="email"
          placeholder={getString("newsletter.email")?.t}
          onChange={handleChange}
          value={email}
          disabled={loading}
        />
        <button
          type="submit"
          name="subscribe"
          className="newsletter-button button"
        >
          {getString("newsletter.submit")?.t}
        </button>
      </form>
    </div>
  );
};
