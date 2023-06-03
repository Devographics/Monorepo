"use client";
/*

1. Check currentUserResponse field on the survey to see if current user has a response
2. If so link to the survey
3. If not use MutatioButton to trigger the `createResponse` mutation
4. If there is an error during the mutation, show it

*/
import { useState } from "react";
import Link from "next/link";
import { SurveyStatusEnum } from "@devographics/types";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { useSurveyActionParams, useBrowserData, PrefilledData } from "./hooks";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "~/lib/users/hooks";
import { Loading } from "~/components/ui/Loading";
import { LoadingButton } from "~/components/ui/LoadingButton";
import { getEditionSectionPath } from "~/lib/surveys/helpers";
import { createResponse } from "./services";
import type { EditionMetadata } from "@devographics/types";
import type { ResponseDocument } from "@devographics/types";
import { useEdition } from "../SurveyContext/Provider";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { ResponseError } from "~/components/error/ResponseError";

const EditionAction = ({ edition }: { edition: EditionMetadata }) => {
  const { id: editionId, surveyId } = edition;
  const [loading, setLoading] = useState(false);
  const [responseError, setResponseError] = useState();
  const { status } = edition;
  const {
    currentUser,
    loading: userLoading,
    error: userError,
  } = useCurrentUser();

  if (userLoading) return <Loading />;
  if (userError) throw new Error(userError);

  const response = currentUser?.responses.find(
    (r) => r.surveyId === surveyId && r.editionId === editionId
  );
  const hasResponse = !!response;

  // hide action button if there is already a duplicate response
  // const hideAction = parsedErrors?.some(
  //   (e) => e.id === duplicateResponseErrorId
  // );

  const isAvailable = status && status !== SurveyStatusEnum.CLOSED;

  const getSurveyAction = () => {
    if (isAvailable) {
      // 1. the survey is available to be filled out
      if (!hasResponse || loading) {
        // 1a. there is no response, or there is a response but we are currently loading it
        return (
          <SurveyStart
            edition={edition}
            loading={loading}
            setLoading={setLoading}
            currentUser={currentUser}
            setErrors={setResponseError}
          />
        );
      } else {
        // 1b. there is a response already
        return (
          <EditionLink response={response} message="general.continue_survey" />
        );
      }
    } else {
      // 2. the survey is no longer available
      return hasResponse ? (
        <EditionLink message="general.review_answers" response={response} />
      ) : (
        <EditionLink message="general.review_survey" readOnly={true} />
      );
    }
  };

  return (
    <div className="survey-action">
      <div className="survey-action-inner">{getSurveyAction()}</div>
      {responseError && <ResponseError responseError={responseError} />}
    </div>
  );
};

const SurveyStart = ({
  loading,
  setLoading,
  currentUser,
  setErrors,
}: {
  edition: EditionMetadata;
  loading: boolean;
  setLoading: any;
  currentUser: any;
  setErrors: any;
}) => {
  const { edition } = useEdition();
  const { id: editionId, surveyId } = edition;
  const router = useRouter();
  const { source, referrer } = useSurveyActionParams();
  const { locale } = useLocaleContext();

  // prefilled data
  let data: PrefilledData = {
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

  const loadingButtonProps = {
    type: "submit",
    loading,
    variant: "primary",
    onClick: async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        // TODO: we might want to use an Error boundary and a Suspense to handle loading and errors
        const result = await createResponse({ data });
        if (result.error) {
          setErrors(result.error);
          setLoading(false);
        } else {
          // no need to stop spinner because it'll disappear when we change page
          // setLoading(false);
          console.log("start survey result", result);
          const pagePath = getEditionSectionPath({
            edition,
            response: result.data,
            number: 1,
            locale,
          });
          console.log(`Redirecting to ${pagePath}…`);
          router.push(pagePath);
        }
      } catch (error) {
        setErrors(error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    },
  };
  return (
    <LoadingButton {...loadingButtonProps}>
      <FormattedMessage id="general.start_survey" />
    </LoadingButton>
  );
};

/*

Link to the "naked" survey path or to the actual response

*/
const EditionLink = ({
  response,
  message,
  readOnly,
}: {
  response?: ResponseDocument;
  message: string;
  readOnly?: boolean;
}) => {
  const { edition } = useEdition();
  const { locale } = useLocaleContext();
  const updatedAt = response && new Date(response.updatedAt);
  return (
    <div className="edition-link">
      <Link
        href={getEditionSectionPath({
          edition,
          response,
          locale,
          readOnly,
        })}
        type="button"
        className="btn btn-primary"
      >
        <FormattedMessage id={message} />
      </Link>
      {response && (
        <div className="edition-response-details">
          <p>
            <FormattedMessage
              id="general.last_modified_on"
              values={{ updatedAt: updatedAt?.toDateString() }}
            />
          </p>
          <p>
            <FormattedMessage
              id="general.completion"
              values={{ completion: response.completion }}
            />
          </p>
        </div>
      )}
    </div>
  );
};

export default EditionAction;
