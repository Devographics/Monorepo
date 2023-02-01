import { useEffect, useState } from "react";

// for some reason this throws error?
// TODO: do we need a dynamic require?
import bowser from "bowser";
// const bowser = require("bowser"); // CommonJS
// import { isAdmin as checkIsAdmin } from "@vulcanjs/permissions";
import { useSearchParams } from "next/navigation";
import { apiRoutes } from "~/lib/apiRoutes";
import { SurveyEdition } from "@devographics/core-models";

export const useSurveyActionParams = (): { source?: string; referrer?: string } => {
  const query = useSearchParams()
  const source = query.get("source") || localStorage.getItem("source");
  const referrer = query.get("referrer") || localStorage.getItem("referrer");
  const params: any = {}
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
    const data = {
      //...data,
      common__user_info__device: info.platform.type,
      common__user_info__browser: info.browser.name,
      common__user_info__version: info.browser.version,
      common__user_info__os: info.os.name,
      common__user_info__referrer: document.referrer,
    };
    setBrowserData(data);
    //if (!data.common__user_info__referrer) {
    //data.common__user_info__referrer = document.referrer;
    //}
  }, []);
  return browserData;
};

export interface BrowserData {
  common__user_info__source?: string;
  common__user_info__referrer?: string;
  common__user_info__device?: string;
  common__user_info__browser?: string;
  common__user_info__version?: string;
  common__user_info__os?: string;
}

export interface PrefilledData extends BrowserData {
  surveySlug?: string;
  context;
  email?: string;
}

export interface ErrorObject {
  id: string;
}
// TODO: POST calls are not using hooks per se
// they could benefit from a refactor after we write a few ones

// transform the graphql error to make it readable
// TODO: improve the backend to avoid this step
// @see start-survey endpoint for the rawError structure
const extractErrorObject = (rawError): ErrorObject | null => {
  if (!rawError) return null
  try {
    const errorObject = JSON.parse(rawError.message);
    return errorObject[0]?.data?.errors[0];
  } catch (error) {
    return { id: "app.unknown_error" };
  }
};

export async function startSurvey(survey: SurveyEdition | SurveyEdition, data: any) {
  // TODO: this should also invalidate the "getCurrentUser" query
  // we should figure how to do so using SWR, maybe in the code that calls startSurvey?
  const fetchRes = await fetch(
    apiRoutes.response.startSurvey.href({ slug: survey.slug!, year: survey.year! }), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }
  )
  if (!fetchRes.ok) {
    console.error(await fetchRes.text())
    throw new Error("Could not start survey, request failed")
  }
  // data/errors is typical of graphql endpoints
  const res: { data?: any, errors?: Array<any> } = await fetchRes.json()
  const errorObject = extractErrorObject(res?.errors?.[0])
  return { data: res.data, error: errorObject }
}

export async function saveSurvey(survey: SurveyEdition | SurveyEdition, data: any) {
  // TODO: this should also invalidate the "getCurrentUser" query
  // we should figure how to do so using SWR, maybe in the code that calls startSurvey?
  const fetchRes = await fetch(
    apiRoutes.response.saveSurvey.href({ slug: survey.slug!, year: survey.year! }), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }
  )
  if (!fetchRes.ok) {
    console.error(await fetchRes.text())
    throw new Error("Could not start survey, request failed")
  }
  // data/errors is typical of graphql endpoints
  const res: { data?: any, errors?: Array<any> } = await fetchRes.json()
  const errorObject = extractErrorObject(res?.errors?.[0])
  return { data: res.data, error: errorObject }
}