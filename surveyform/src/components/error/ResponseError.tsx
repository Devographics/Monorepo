"use client";
import Link from "next/link";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { useEdition } from "../SurveyContext/Provider";
import type { DetailedErrorObject } from "~/lib/validation";
import { T, useI18n } from "@devographics/react-i18n";

export const duplicateResponseErrorId = "duplicate_response";

export const ResponseError = ({
  responseError,
}: {
  responseError: DetailedErrorObject;
}) => {
  console.log("responseError", { responseError });
  const { locale } = useI18n()
  const { id, properties } = responseError;
  const { edition } = useEdition();
  return (
    <div className="survey-item-error error message">
      <h5 className="error-code">
        <code>{id}</code>
      </h5>

      <ResponseErrorContents responseError={responseError} />

      {id === duplicateResponseErrorId && (
        <Link
          href={getEditionSectionPath({
            edition,
            survey: edition.survey,
            response: { _id: properties.responseId },
            locale,
          })}
        >
          <T token="general.continue_survey" />
        </Link>
      )}
    </div>
  );
};

export const ResponseErrorContents = ({
  responseError,
}: {
  responseError: DetailedErrorObject;
}) => {
  const { id, message, error, properties } = responseError;
  return (
    <div>
      <T token={`error.${id}`} fallback={message} />
    </div>
  );
};
