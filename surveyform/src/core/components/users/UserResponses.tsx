import Link from "next/link";
import { statusesReverse } from "~/modules/constants";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { useUser } from "~/account/user/hooks";
import { useUserResponses } from "~/modules/responses/hooks";
import { Loading } from "../ui/Loading";
import { SerializedSurveyDocument } from "@devographics/core-models";

const UserResponses = () => {
  const { user, loading: userLoading, error: userError } = useUser();
  // TODO: fetch data during SSR instead?
  const {
    responses,
    loading: responseLoading,
    error: responseError,
  } = useUserResponses();
  if (userLoading) return <Loading />;
  if (userError) throw new Error(userError);
  if (responseLoading) return <Loading />;
  if (responseError) throw new Error(userError);
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
  survey,
}: {
  createdAt?: string | null;
  pagePath: string;
  completion?: number;
  survey?: SerializedSurveyDocument;
}) => {
  if (!survey) {
    return null;
  }
  const { status, name, year, resultsUrl } = survey;
  if (typeof status === "undefined") {
    throw new Error("Survey status is not defined, can't display response");
  }

  const surveyStatus = statusesReverse[status];
  return (
    <li className="response-item">
      <h4 className="response-item-survey">
        <Link href={pagePath}>
          {name} {year}
        </Link>
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
