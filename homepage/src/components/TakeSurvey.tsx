import React, { useState, useEffect } from "react";
import qs from "qs";
import T from "@components/T";

export default function TakeSurvey({ locale, url }) {
  let suffix = "";
  const [source, setSource] = useState();
  const [referrer, setReferrer] = useState("");

  useEffect(() => {
    const q = qs.parse(window.location.href.split("?")[1]);
    setSource(q.source);
    if (document.referrer) {
      const { hostname: referrerHostname } = new URL(document.referrer);
      const { hostname: currentHostname } = new URL(window.location.href);
      if (referrerHostname !== currentHostname) {
        setReferrer(document.referrer);
      }
    }
  });

  if (source || referrer) {
    suffix = "?";
    if (source) {
      suffix += `source=${source}&`;
    }
    if (referrer) {
      suffix += `referrer=${referrer}&`;
    }
  }

  return (
    <a href={url + suffix} className="button">
      <T locale={locale} k="homepage.take_survey" />
    </a>
  );
}
