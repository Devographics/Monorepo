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
import { useRouter } from "next/navigation";
import { useCurrentUser } from "~/lib/users/hooks";
import { Loading } from "~/components/ui/Loading";
import { LoadingButton } from "~/components/ui/LoadingButton";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { createResponse } from "./services";
import type { EditionMetadata } from "@devographics/types";
import type { ResponseDocument } from "@devographics/types";
import { useEdition } from "../SurveyContext/Provider";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import { ResponseError } from "~/components/error/ResponseError";
import { ResponseDetails } from "../surveys/ResponseDetails";
import { clearLocalStorageData, useClientData } from "./hooks";



import { T } from "@devographics/react-i18n"

/**
 * - Logged in and survey open : create new response
 * - Logged in and survey open and resutls : update response
 * - Logged in and survey closed and results : see response
 * - survey closed and (logged in and no results || logged out): see outline
 *
 */
const EditionAction = ({ edition }: { edition: EditionMetadata }) => {
  const { id: editionId, surveyId } = edition;
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

  const isAvailable = status && status !== SurveyStatusEnum.CLOSED;

  const getSurveyAction = () => {
    if (isAvailable) {
      // 1. the survey is available to be filled out
      if (!hasResponse) {
        // 1a. there is no response yet
        return <SurveyStart edition={edition} setErrors={setResponseError} />;
      } else {
        // 1b. there is a response already
        return (
          <EditionLink response={response} message={<T token="general.continue_survey" />} />
        );
      }
    } else {
      // 2. the survey is no longer available
      return hasResponse ? (
        <EditionLink message={<T token="general.review_answers" />} response={response} />
      ) : (
        // will point to the outline
        <EditionLink message={<T token="general.review_survey" />} readOnly={true} />
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
  setErrors,
}: {
  edition: EditionMetadata;
  setErrors: any;
}) => {
  const [loading, setLoading] = useState(false);
  const { edition } = useEdition();
  const router = useRouter();
  const { locale } = useLocaleContext();

  const data = useClientData({
    surveyId: edition.survey.id,
    editionId: edition.id,
  });

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
          // we don't need this data to be stored locally anymore, so clear it
          clearLocalStorageData();
          // no need to stop spinner because it'll disappear when we change page
          // setLoading(false);
          console.log("start survey result", result);
          const pagePath = getEditionSectionPath({
            edition,
            survey: edition.survey,
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
      <T token="general.start_survey" />
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
  message: string | React.ReactNode;
  readOnly?: boolean;
}) => {
  const { edition } = useEdition();
  const { locale } = useLocaleContext();
  return (
    <div className="edition-link">
      <Link
        href={getEditionSectionPath({
          edition,
          survey: edition.survey,
          response,
          locale,
          readOnly,
        })}
        type="button"
        className="btn btn-primary"
      >
        {message}
      </Link>
      <ResponseDetails edition={edition} response={response} />
    </div>
  );
};

export default EditionAction;
