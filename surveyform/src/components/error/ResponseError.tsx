import Link from "next/link";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getEditionSectionPath } from "~/lib/surveys/helpers";
import { useEdition } from "../SurveyContext/Provider";
import { useLocaleContext } from "~/i18n/context/LocaleContext";
import type { ServerErrorObject } from "~/lib/validation";

export const duplicateResponseErrorId = "duplicate_response";

export const ResponseError = ({
  responseError,
}: {
  responseError: ServerErrorObject;
}) => {
  console.log("responseError", { responseError });
  const { locale } = useLocaleContext();
  const { id, properties } = responseError;
  const { edition, editionPathSegments } = useEdition();
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
            response: { _id: properties.responseId },
            editionPathSegments,
            locale,
          })}
        >
          <FormattedMessage id="general.continue_survey" />
        </Link>
      )}
    </div>
  );
};

export const ResponseErrorContents = ({
  responseError,
}: {
  responseError: ServerErrorObject;
}) => {
  const { id, message, error, properties } = responseError;
  return (
    <div>
      <FormattedMessage id={`error.${id}`} defaultMessage={message} />
    </div>
  );
};
