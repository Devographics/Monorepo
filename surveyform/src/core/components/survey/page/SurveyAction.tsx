/*

1. Check currentUserResponse field on the survey to see if current user has a response
2. If so link to the survey
3. If not use MutatioButton to trigger the `createResponse` mutation
4. If there is an error during the mutation, show it

*/
import React, { useState } from "react";
import Link from "next/link";
import get from "lodash/get.js";
import { getSurveyPath } from "~/modules/surveys/getters";
import isEmpty from "lodash/isEmpty.js";
import { statuses } from "~/modules/constants";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { getErrors } from "@vulcanjs/core";
import { SurveyType } from "@devographics/core-models";
import { UserType } from "~/core/models/user";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import {
  useSurveyActionParams,
  useBrowserData,
  PrefilledData,
  useStartSurveyMutation,
} from "./hooks";
import { useRouter } from "next/navigation";
import { useUser } from "~/account/user/hooks";
import { useUserResponse } from "~/modules/responses/hooks";
import { Loading } from "../../ui/Loading";

const duplicateResponseErrorId = "error.duplicate_response";

const extractError = (rawError: any) => {
  try {
    const errorObject = JSON.parse(rawError.message);
    return errorObject[0]?.data?.errors[0];
  } catch (error) {
    return { id: "app.unknown_error" };
  }
};

const SurveyAction = ({
  survey,
}: //currentUser,
{
  survey: SurveyType;
  currentUser?: UserType;
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Array<any> | undefined>();
  const { slug, status } = survey;
  if (!slug) throw new Error("Slug not found in SurveyAction");
  const { user, loading: userLoading, error: userError } = useUser();
  // TODO: fetch data during SSR instead?
  const {
    response,
    loading: responseLoading,
    error: responseError,
  } = useUserResponse({ surveySlug: slug });
  if (userLoading) return <Loading />;
  if (userError) throw new Error(userError);
  if (responseLoading) return <Loading />;
  if (responseError) throw new Error(responseError);
  //const currentSurveyResponse = responses?.find((r) => r.surveySlug === slug);

  const hasResponse = response && !isEmpty(response);

  const parsedErrors = errors && errors.map(extractError);

  // hide action button if there is already a duplicate response
  const hideAction =
    parsedErrors && parsedErrors.some((e) => e.id === duplicateResponseErrorId);

  const isAvailable =
    status &&
    [statuses.preview, statuses.open, statuses.hidden].includes(status);

  const getSurveyAction = () => {
    if (isAvailable) {
      // 1. the survey is available to be filled out
      if (!hasResponse || loading) {
        // 1a. there is no response, or there is a response but we are currently loading it
        return (
          <SurveyStart
            survey={survey}
            loading={loading}
            setLoading={setLoading}
            currentUser={user}
            setErrors={setErrors}
          />
        );
      } else {
        // 1b. there is a response already
        return (
          <SurveyLink
            survey={survey}
            response={response}
            message="general.continue_survey"
          />
        );
      }
    } else {
      // 2. the survey is no longer available
      return (
        <SurveyLink
          survey={survey}
          message="general.review_survey"
          {...(hasResponse && { response })}
        />
      );
    }
  };

  return (
    <div className="survey-action">
      {!hideAction && (
        <div className="survey-action-inner">{getSurveyAction()}</div>
      )}
      {parsedErrors && (
        <Errors
          survey={survey}
          parsedErrors={parsedErrors}
          currentSurveyResponse={response}
        />
      )}
    </div>
  );
};

const SurveyStart = ({
  survey,
  loading,
  setLoading,
  currentUser,
  setErrors,
}) => {
  const { slug, status, context } = survey;
  const router = useRouter();
  const { startSurvey, mutationName } = useStartSurveyMutation(survey);
  const Components = useVulcanComponents();
  const { source, referrer } = useSurveyActionParams();

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

  const loadingButtonProps = {
    type: "submit",
    loading,
    variant: "primary",
    onClick: async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const result = await startSurvey({
          variables: { input: { data } },
        });
        // no need to stop spinner because it'll disappear when we change page
        // setLoading(false);
        console.log(result);
        const pagePath = get(result, `data.${mutationName}.data.pagePath`);
        console.log(`Redirecting to ${pagePath}…`);
        router.push(pagePath);
      } catch (error) {
        setErrors(getErrors(error));
      }
    },
  };
  return (
    <Components.LoadingButton {...loadingButtonProps}>
      <FormattedMessage id="general.start_survey" />
    </Components.LoadingButton>
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
  return (
    // TODO: see https://www.npmjs.com/package/react-router-bootstrap
    // We should probably use a NavLink bootstrap component
    //<LinkContainer to={response.pagePath || getSurveyPath({ survey })}>
    //</LinkContainer>
    <Link
      href={response.pagePath || getSurveyPath({ survey, readOnly: true })}
      type="button"
      className="btn btn-primary"
    >
      <FormattedMessage id={message} />
    </Link>
  );
};

const Errors = ({ survey, parsedErrors, currentSurveyResponse }) => {
  return (
    <>
      {parsedErrors.map((error, i) => (
        <ErrorItem
          key={i}
          error={error}
          survey={survey}
          response={currentSurveyResponse}
        />
      ))}
    </>
  );
};
const ErrorItem = ({ survey, error, response }) => {
  console.log(error);
  const { id, message, properties } = error;
  return (
    <div className="survey-item-error error message">
      <FormattedMessage id={id} />{" "}
      {id === duplicateResponseErrorId && (
        <Link
          href={getSurveyPath({
            survey,
            response: { _id: properties.responseId },
          })}
        >
          <FormattedMessage id="general.continue_survey" />
        </Link>
      )}
    </div>
  );
};

export default SurveyAction;
