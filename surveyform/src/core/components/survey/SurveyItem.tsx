/*

1. Check currentUserResponse field on the survey to see if current user has a response
2. If so link to the survey
3. If not use MutatioButton to trigger the `createResponse` mutation
4. If there is an error during the mutation, show it

*/
import React, { useState } from "react";
// import { LinkContainer } from "react-router-bootstrap";
import { getErrors } from "@vulcanjs/core";
import get from "lodash/get.js";
import Link from "next/link"; //"react-router-dom";
import { getSurveyPath } from "~/modules/surveys/getters";
import isEmpty from "lodash/isEmpty.js";
import { statuses } from "~/modules/constants";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useRouter } from "next/router.js";
import gql from "graphql-tag";
import { getFragmentName } from "@vulcanjs/graphql";
import { CreateResponseOutputFragment } from "~/modules/responses/fragments";

// for some reason this throws error?
// import bowser from 'bowser';
// const bowser = require("bowser"); // CommonJS

const SurveyItem = ({ survey, currentUser }) => {
  const Components = useVulcanComponents();
  const router = useRouter();
  const [errors, setErrors] = useState<Array<any> | undefined>();

  const { slug, name, year, imageUrl, status } = survey;
  const currentSurveyResponse =
    currentUser && currentUser.responses.find((r) => r.surveySlug === slug);

  // prefilled data
  let data = {
    surveyId: survey._id,
    // Seems like some legacy code
    // aboutyou_youremail: currentUser && currentUser.email,
  };

  // if (typeof window !== 'undefined') {
  //   const browser = bowser.getParser(window.navigator.userAgent);
  //   const info = browser.parse().parsedResult;
  //   data = {
  //     ...data,
  //     device: info.platform.type,
  //     browser: info.browser.name,
  //     version: info.browser.version,
  //     os: info.os.name,
  //     referrer: document.referrer,
  //     source: window.source,
  //   };
  // }

  return (
    <div className="survey-item">
      <div className="survey-item-contents">
        <div className="survey-image">
          <img src={`/surveys/${imageUrl}`} alt={name} />
        </div>
        <h3 className="survey-name">
          {name} {year}
        </h3>
        <div className="survey-action">
          {currentSurveyResponse && !isEmpty(currentSurveyResponse) ? (
            //<LinkContainer to={currentSurveyResponse.pagePath}>
            <Link href={currentSurveyResponse.pagePath}>
              <a>
                <Components.Button>
                  {status === statuses.open ? (
                    <Components.FormattedMessage id="general.continue_survey" />
                  ) : (
                    <Components.FormattedMessage id="general.review_survey" />
                  )}
                </Components.Button>
              </a>
            </Link>
          ) : // </LinkContainer>
          status === statuses.open ? (
            <Components.MutationButton
              loadingButtonProps={{
                label: (
                  <Components.FormattedMessage id="general.start_survey" />
                ),
                variant: "primary",
              }}
              mutation={gql`
                mutation createResponse($input: CreateResponseInput) {
                  ...${getFragmentName(CreateResponseOutputFragment)}
                }
                ${CreateResponseOutputFragment}
              `}
              /*
                  mutationOptions={{
                    name: "createResponse",
                    args: { input: "CreateResponseInput" },
                    fragmentName: "CreateResponseOutputFragment",
                  }}*/
              mutationArguments={{ input: { data } }}
              successCallback={(result) => {
                router.push(get(result, "data.createResponse.data.pagePath"));
              }}
              errorCallback={(error) => {
                setErrors(getErrors(error));
              }}
            />
          ) : (
            <div className="survey-action-closed">Survey closed.</div>
          )}
        </div>
      </div>
      {errors &&
        errors.map((error) => (
          <ErrorItem
            key={error.id}
            {...error}
            survey={survey}
            response={currentSurveyResponse}
          />
        ))}
    </div>
  );
};

const ErrorItem = ({ survey, id, message, properties, response }) => {
  if (id === "responses.duplicate_responses") {
    return (
      <div className="survey-item-error error message">
        {message}{" "}
        <Link href={getSurveyPath({ survey, response })}>
          <a>Continue Survey →</a>
        </Link>
      </div>
    );
  } else {
    return <div className="survey-item-error error">{message}</div>;
  }
};

export default SurveyItem;
