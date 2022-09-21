/*

1. Check currentUserResponse field on the survey to see if current user has a response
2. If so link to the survey
3. If not use MutatioButton to trigger the `createResponse` mutation
4. If there is an error during the mutation, show it

*/
import React, { useEffect, useState } from "react";
//import { LinkContainer } from "react-router-bootstrap";
//import { Link } from "react-router-dom";
import Link from "next/link";
import get from "lodash/get.js";
import { getSurveyPath } from "~/modules/surveys/getters";
import isEmpty from "lodash/isEmpty.js";
import { statuses } from "~/modules/constants";

// for some reason this throws error?
// TODO: do we need a dynamic require?
import bowser from "bowser";
// const bowser = require("bowser"); // CommonJS
// import { isAdmin as checkIsAdmin } from "@vulcanjs/permissions";
import { useRouter } from "next/router.js";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { getErrors } from "@vulcanjs/core";
import { SurveyType } from "@devographics/core-models";
import gql from "graphql-tag";
import { getFragmentName } from "@vulcanjs/graphql";
import { CreateResponseOutputFragment } from "~/modules/responses/fragments";
import { UserType } from "~/core/models/user";
import { useQuery } from "@apollo/client";

const useSurveyActionParams = ():
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

const useBrowserData = (): BrowserData => {
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

interface BrowserData {
  common__user_info__source?: string;
  common__user_info__referrer?: string;
  common__user_info__device?: string;
  common__user_info__browser?: string;
  common__user_info__version?: string;
  common__user_info__os?: string;
}
interface PrefilledData extends BrowserData {
  surveySlug?: string;
  context;
  email?: string;
}
const SurveyAction = ({
  survey,
}: //currentUser,
{
  survey: SurveyType;
  currentUser?: UserType;
}) => {
  //const isAdmin = checkIsAdmin(currentUser);
  const Components = useVulcanComponents();
  const [errors, setErrors] = useState<Array<any> | undefined>();
  const { paramsReady, source, referrer } = useSurveyActionParams();
  const router = useRouter();
  // TODO: what to do if params are not ready?

  const { slug, status, context } = survey;
  // TODO: could be simplified by allowing to pass a fragment to useCurrentUser (we need "responses" which is a graphql only field)
  const currentUser = useCurrentUserWithResponses();
  const currentSurveyResponse = currentUser?.responses?.find(
    (r) => r.surveySlug === slug
  );

  // prefilled data
  let data: PrefilledData = {
    surveySlug: slug,
    context,
    email: currentUser?.email,
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

  const hasResponse = currentSurveyResponse && !isEmpty(currentSurveyResponse);

  const surveyCreateResponseOutputFragment =
    CreateResponseOutputFragment(survey);
  const mutationButtonProps = {
    loadingButtonProps: {
      label: <Components.FormattedMessage id="general.start_survey" />,
      variant: "primary",
    },
    mutation: gql`
    mutation createResponse($input: CreateResponseInput) {
      createResponse(input: $input) {
        ...${getFragmentName(surveyCreateResponseOutputFragment)}
      }
    }
    ${surveyCreateResponseOutputFragment}
    `,
    mutationOptions: {
      /* name: "createResponse",
      args: { input: "CreateResponseInput" },
      fragmentName: "CreateResponseOutputFragment",
      mutationOptions: {*/
      refetchQueries: ["getCurrentUser"],
      //},
    },
    mutationArguments: { input: { data } },
    successCallback:
      (result: // TODO: how to type this better? It's the return of a createMutation, we may have this type already in vulcan?
      {
        data: { createResponse: { data: { pagePath: string } } };
      }) => {
        //console.log("calling success cb");
        router.push(get(result, "data.createResponse.data.pagePath"));
      },
    errorCallback: (error) => {
      setErrors(getErrors(error));
    },
  };

  return (
    <div className="survey-action">
      <div className="survey-action-inner">
        {status === statuses.preview ||
        status === statuses.open ||
        status === statuses.hidden ? (
          hasResponse ? (
            <SurveyLink
              survey={survey}
              response={currentSurveyResponse}
              message="general.continue_survey"
            />
          ) : (
            <Components.MutationButton {...mutationButtonProps} />
          )
        ) : status === statuses.closed ? (
          hasResponse ? (
            <SurveyLink
              survey={survey}
              response={currentSurveyResponse}
              message="general.review_survey"
            />
          ) : (
            <SurveyLink survey={survey} message="general.review_survey" />
          )
        ) : null}
      </div>
      {errors &&
        errors.map((error, i) => (
          <ErrorItem
            key={i}
            {...error}
            survey={survey}
            response={currentSurveyResponse}
          />
        ))}
    </div>
  );
};

/*

Link to the "naked" survey path or to the actual response

*/
const SurveyLink = ({
  survey,
  response = {},
  message,
}: {
  survey: SurveyType;
  response?: { pagePath?: string };
  message: string;
}) => {
  const Components = useVulcanComponents();
  return (
    // TODO: see https://www.npmjs.com/package/react-router-bootstrap
    // We should probably use a NavLink bootstrap component
    //<LinkContainer to={response.pagePath || getSurveyPath({ survey })}>
    <Link href={response.pagePath || getSurveyPath({ survey })}>
      {/* This simulates what a "LinkContainer" is doing in react-router-bootstrap, replacing the button by a link*/}
      <a type="button" className="btn btn-primary">
        {/*<Components.Button>*/}
        <Components.FormattedMessage id={message} />
        {/* </Components.Button>*/}
      </a>
    </Link>
    //</LinkContainer>
  );
};
const ErrorItem = ({ survey, id, message, properties, response }) => {
  const Components = useVulcanComponents();
  if (id === "responses.duplicate_responses") {
    return (
      <div className="survey-item-error error message">
        {message}{" "}
        <Link href={getSurveyPath({ survey, response })}>
          <a>
            <Components.FormattedMessage id="general.continue_survey" />
          </a>
        </Link>
      </div>
    );
  } else {
    return <div className="survey-item-error error message">{message}</div>;
  }
};

export default SurveyAction;
