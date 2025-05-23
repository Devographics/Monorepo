import { useEffect, useState } from "react";

import type { PrefilledResponse, BrowserData } from "@devographics/types";
// for some reason this throws error?
// TODO: do we need a dynamic require?
import bowser from "bowser";
import { useReferrer } from "../common/ReferrerStorage";
import { useI18n } from "@devographics/react-i18n";

export const useSurveyActionParams = (): {
  source?: string;
  referrer?: string;
} => {
  // note: source and referrer are set by ClientLayout on first page load
  const params: any = {};
  const { source, referrer } = useReferrer();
  if (source) {
    params.source = source as string;
  }
  if (referrer) {
    try {
      const { hostname: referrerHostname } = new URL(referrer.toString());
      const { hostname: currentHostname } = new URL(window.location.href);
      if (referrerHostname !== currentHostname) {
        params.referrer = referrer as string;
      }
    } catch (error) {
      // if referrer is not a valid URL, do nothing
    }
  }
  return params;
};

export const useBrowserData = (): BrowserData => {
  const [browserData, setBrowserData] = useState({});
  //if (typeof window !== "undefined") {
  useEffect(() => {
    const browser = bowser.getParser(window.navigator.userAgent);
    // TODO: should it need an update?
    // @ts-expect-error
    const info = browser.parse().parsedResult;

    const data: BrowserData = {
      common__user_info__device: info.platform.type,
      common__user_info__browser: info.browser.name,
      common__user_info__version: info.browser.version,
      common__user_info__os: info.os.name,
    };
    if (document.referrer) {
      data.common__user_info__referrer = document.referrer;
    }
    setBrowserData(data);
    //if (!data.common__user_info__referrer) {
    //data.common__user_info__referrer = document.referrer;
    //}
  }, []);
  return browserData;
};

export const useClientData = ({
  editionId,
  surveyId,
}: {
  editionId?: string;
  surveyId?: string;
}) => {
  const { source, referrer } = useSurveyActionParams();
  const { locale } = useI18n();
  // prefilled data
  let data: PrefilledResponse = {
    locale: locale.id,
    editionId,
    surveyId,
    common__user_info__source: source,
    common__user_info__referrer: referrer,
  };

  const browserData = useBrowserData();
  data = {
    ...data,
    ...browserData,
    // override only if referrer is not set already
    common__user_info__referrer:
      data.common__user_info__referrer ||
      browserData?.common__user_info__referrer,
  };
  return data;
};

export const clearLocalStorageData = () => {
  localStorage.removeItem("source");
  localStorage.removeItem("referrer");
};
