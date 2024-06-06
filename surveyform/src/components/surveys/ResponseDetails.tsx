import {
  EditionMetadata,
  ResponseDocument,
  ResultsStatusEnum,
} from "@devographics/types";
import { ServerT } from "~/i18n/components/ServerT";

export const ResponseDetails = ({
  edition,
  response,
}: {
  edition: EditionMetadata;
  response?: ResponseDocument;
}) => {
  const { resultsUrl, resultsStatus } = edition;
  return (
    <div className="response-details">
      {response && <ResponseMetadata response={response} />}
      {resultsUrl && resultsStatus === ResultsStatusEnum.PUBLISHED && (
        <p>
          <a href={resultsUrl}>
            <ServerT token="general.survey_results" />
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
          <ServerT
            token="general.last_modified_on"
            values={{ updatedAt: new Date(updatedAt)?.toDateString() }}
          />
        ) : (
          <ServerT
            token="general.started_on"
            values={{ createdAt: new Date(createdAt)?.toDateString() }}
          />
        )}
      </p>
      {typeof completion !== "undefined" && (
        <p>
          <ServerT token="general.completion" values={{ completion }} />
        </p>
      )}
    </>
  );
};
