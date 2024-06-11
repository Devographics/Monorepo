import { teapot } from "@devographics/react-i18n";
import {
  EditionMetadata,
  ResponseDocument,
  ResultsStatusEnum,
} from "@devographics/types";
import { tokens } from "./ResponseDetails.tokens";

const { T } = teapot(tokens)

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
            <T token="general.survey_results" />
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
          <T
            token="general.last_modified_on"
            values={{ updatedAt: new Date(updatedAt)?.toDateString() }}
          />
        ) : (
          <T
            token="general.started_on"
            values={{ createdAt: new Date(createdAt)?.toDateString() }}
          />
        )}
      </p>
      {typeof completion !== "undefined" && (
        <p>
          <T token="general.completion" values={{ completion }} />
        </p>
      )}
    </>
  );
};
