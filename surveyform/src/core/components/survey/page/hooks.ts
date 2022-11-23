import React, { useEffect, useState } from "react";

// for some reason this throws error?
// TODO: do we need a dynamic require?
import bowser from "bowser";
// const bowser = require("bowser"); // CommonJS
// import { isAdmin as checkIsAdmin } from "@vulcanjs/permissions";
import { useRouter } from "next/router.js";
import gql from "graphql-tag";
import { UserType } from "~/core/models/user";
import { useQuery } from "@apollo/client";
import { SurveyResponseFragment } from "~/modules/responses/fragments";
import { useMutation } from "@apollo/client";
import { getFragmentName } from "@vulcanjs/graphql";
import { CreateResponseOutputFragment } from "~/modules/responses/fragments";

export const useSurveyActionParams = ():
  | { paramsReady: false; source: undefined; referrer: undefined }
  | { paramsReady: true; source?: string; referrer?: string } => {
  const router = useRouter();
  const { isReady, isFallback, query } = router;
  if (!isReady || isFallback)
    return { paramsReady: false, source: undefined, referrer: undefined };
  const source = query.source || localStorage.getItem("source");
  const referrer = query.referrer || localStorage.getItem("referrer");
  const params = { paramsReady: true } as {
    paramsReady: true;
    source?: string;
    referrer?: string;
  };
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

export const useCurrentUserWithResponses = () => {
  const {
    data: currentUserData,
    loading: loadingCurrentUser,
    error: any,
  } = useQuery(
    gql`
      query getCurrentUser {
        currentUser {
          ...UsersCurrentSurveyAction
          __typename
        }
      }

      fragment UsersCurrentSurveyAction on User {
        _id
        username
        createdAt
        isAdmin
        groups
        responses {
          _id
          pagePath
          surveySlug
          completion
          createdAt
          survey {
            slug
            prettySlug
            name
            year
            domain
            status
            imageUrl
            faviconUrl
            socialImageUrl
            resultsUrl
          }
        }
        __typename
      }
    `
  );
  const currentUser = currentUserData?.currentUser;
  if (!currentUser) return null;
  return currentUser as UserType;
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

// const mutationName = "createResponse";
export const mutationName = "startSurvey";

export const useStartSurveyMutation = (survey) => {
  const surveyCreateResponseOutputFragment =
    CreateResponseOutputFragment(survey);

  const mutation = gql`
  mutation ${mutationName}($input: CreateResponseInput) {
    ${mutationName}(input: $input) {
      ...${getFragmentName(surveyCreateResponseOutputFragment)}
    }
  }
  ${surveyCreateResponseOutputFragment}
  `;

  const [startSurvey, { data, loading, error }] = useMutation(mutation, {
    refetchQueries: ["getCurrentUser"],
  });
  return { startSurvey, data, loading, error, mutationName };
};
