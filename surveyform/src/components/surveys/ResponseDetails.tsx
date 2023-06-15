import { EditionMetadata, ResponseDocument } from "@devographics/types";
import { FormattedMessage } from "~/components/common/FormattedMessage";

export const ResponseDetails = ({
  edition,
  response,
}: {
  edition: EditionMetadata;
  response?: ResponseDocument;
}) => {
  const { resultsUrl } = edition;
  return (
    <div className="response-details">
      {response && <ResponseMetadata response={response} />}
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

const ResponseMetadata = ({ response }: { response: ResponseDocument }) => {
  const { updatedAt, createdAt, completion } = response;
  return (
    <>
      <p>
        {updatedAt ? (
          <FormattedMessage
            id="general.last_modified_on"
            values={{ updatedAt: new Date(updatedAt)?.toDateString() }}
          />
        ) : (
          <FormattedMessage
            id="general.started_on"
            values={{ createdAt: new Date(createdAt)?.toDateString() }}
          />
        )}
      </p>
      <p>
        <FormattedMessage id="general.completion" values={{ completion }} />
      </p>
    </>
  );
};
