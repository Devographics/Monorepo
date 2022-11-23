import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useCurrentUserWithResponses } from "~/core/components/survey/page/hooks";
import Link from "next/link";
import { statusesReverse } from "~/modules/constants";
import orderBy from "lodash/orderBy.js";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

const UserResponses = ({ user }) => {
  const Components = useVulcanComponents();
  const currentUser = useCurrentUserWithResponses();
  const responses = orderBy(currentUser?.responses, "createdAt", "desc");
  return (
    <div>
      <div>
        <h3>
          <FormattedMessage id="accounts.your_surveys" />
        </h3>
        <ul className="user-responses-list">
          {responses &&
            responses.map((response) => (
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

const ResponseItem = ({ createdAt, pagePath, completion = 0, survey }) => {
  const Components = useVulcanComponents();

  if (!survey) {
    return null;
  }
  const { status, name, year, resultsUrl } = survey;

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
          values={{ startedAt: createdAt.substr(0, 10), completion }}
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
