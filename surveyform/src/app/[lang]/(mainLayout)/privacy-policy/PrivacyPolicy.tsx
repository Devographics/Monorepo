import React from "react";

const PrivacyPolicy = () => (
  <div className="contents-narrow privacy-policy">
    <h2>Privacy Policy/FAQ</h2>
    <h3>What data do you collect?</h3>
    <p>
      In addition to the data collected by the survey itself, we collect your
      device, browser, OS, browser version, and referrer.
    </p>
    <h3>I don't want to tell you my country/salary/email/etc.</h3>
    <p>
      All questions are entirely optional unless marked otherwise, and you can
      leave any of them blank.
    </p>
    <h3>What cookies do you set?</h3>
    <p>
      We set a log-in cookie, and our hosting provider (
      <a href="https://www.meteor.com/hosting">Galaxy</a>) also sets its own
      cookie. We do not set any other cookie or use client-side analytics or
      ads.
    </p>
    <h3>What will you do with this data?</h3>
    <p>
      We process the data and then use it to publish reports. We also make the
      anonymized (emails removed) dataset publicly available.
    </p>
    <h3>
      Who will have access to my data? Will any third parties see my data?
    </h3>
    <p>
      The [State of JavaScript team](https://github.com/orgs/StateOfJS/people)
      will have access to the full dataset including emails. The anonymized
      dataset (without emails) will be made public. No third party will be given
      access to the non-anonymized data.
    </p>
    <h3>Why do you need me to create an account?</h3>
    <p>
      We ask respondents to create an account because this makes it easier for
      us to save in-progress sessions, as well as give you access to your own
      data in the future.{" "}
    </p>
    <h3>What will you use my email for?</h3>
    <p>
      We will contact you once the survey results are available, as well as when
      we launch future editions of this survey (or related surveys, such as the{" "}
      <a href="http://stateofcss.com/">State of CSS survey</a>). We may also
      send you other infrequent emails (around 3 or 4 per year) about general
      updates or announcements. You can unsubscribe from our mailing list at any
      time.
    </p>
    <h3>How can I delete my data and/or account?</h3>
    <p>
      You can email us at{" "}
      <a href="mailto:hello@stateofjs.com">hello@stateofjs.com</a> if you'd like
      us to delete all or part of your data.
    </p>
  </div>
);

export default PrivacyPolicy;
