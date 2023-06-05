import { ResponseDocument } from "@devographics/types";
import { FormattedMessage } from "~/components/common/FormattedMessage";

export const ResponseDetails = ({
  response,
}: {
  response: ResponseDocument;
}) => {
  const updatedAt = response && new Date(response.updatedAt);

  return (
    <div className="response-details">
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
  );
};
