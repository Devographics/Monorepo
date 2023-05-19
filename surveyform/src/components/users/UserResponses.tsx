import Link from "next/link";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import { UserDocument } from "~/account/user/typings";

const UserResponses = ({
  responses,
  user,
}: {
  responses: Array<ResponseDocument>;
  user: UserDocument;
}) => {
  return (
    <div>
      <div>
        <h3>
          <FormattedMessage id="accounts.your_surveys" />
        </h3>
        <ul className="user-responses-list">
          {responses &&
            responses.map((response) => (
              // @ts-ignore Not sure if we should use Date or string
              <ResponseItem key={response._id} {...response} />
            ))}
        </ul>
      </div>
      {/* <div>
        <h3>
          <FormattedMessage id="account.past_surveys" />
        </h3>
        <ul>
          <ResponseItem response={{}}/>
        </ul>
      </div> */}
    </div>
  );
};

const ResponseItem = ({
  createdAt,
  pagePath,
  completion = 0,
  edition,
}: {
  createdAt?: string | null;
  pagePath: string;
  completion?: number;
  edition?: EditionMetadata;
}) => {
  if (!edition) {
    return null;
  }
  const { status, year, resultsUrl } = edition;
  if (typeof status === "undefined") {
    throw new Error("Survey status is not defined, can't display response");
  }

  const surveyStatus = "todo";
  return (
    <li className="response-item">
      <h4 className="response-item-survey">
        <Link href={pagePath}>{year}</Link>
        <span className={`survey-status survey-status-${surveyStatus}`}>
          <FormattedMessage id={`general.survey_status_${surveyStatus}`} />
        </span>
      </h4>
      <div className="response-item-details">
        <FormattedMessage
          id="response.details"
          // TODO: not sure if createdAt is a string or Date here
          values={{ startedAt: createdAt?.substr(0, 10), completion }}
        />{" "}
        {resultsUrl && (
          <a href={resultsUrl}>
            <FormattedMessage id="response.view_results" />
          </a>
        )}
      </div>
    </li>
  );
};

export default UserResponses;
