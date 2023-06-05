import { EditionMetadata, ResponseDocument } from "@devographics/types";
import { FormattedMessage } from "~/components/common/FormattedMessage";

export const ResponseDetails = ({
  edition,
  response,
}: {
  edition: EditionMetadata;
  response?: ResponseDocument;
}) => {
  const updatedAt = response && new Date(response.updatedAt);
  const { resultsUrl } = edition;
  return (
    <div className="response-details">
      {response && (
        <>
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
        </>
      )}

      {resultsUrl && (
        <p>
          <a href={resultsUrl}>
            <FormattedMessage id="general.survey_results" />
          </a>
        </p>
      )}
    </div>
  );
};
