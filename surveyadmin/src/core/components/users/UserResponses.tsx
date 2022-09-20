import { useVulcanComponents } from "@vulcanjs/react-ui";
import { useCurrentUserWithResponses } from "~/core/components/survey/page/SurveyAction";
import Link from "next/link";
import { statusesReverse } from "~/modules/constants";
import orderBy from "lodash/orderBy.js";

const UserResponses = ({ user }) => {
  const Components = useVulcanComponents();
  const currentUser = useCurrentUserWithResponses();
  const responses = orderBy(currentUser?.responses, "createdAt", "desc");
  return (
    <div>
      <div>
        <h3>
          <Components.FormattedMessage id="accounts.your_surveys" />
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
          <Components.FormattedMessage id="account.past_surveys" />
        </h3>
        <ul>
          <ResponseItem response={{}}/>
        </ul>
      </div> */}
    </div>
  );
};

const ResponseItem = ({ createdAt, pagePath, completion = 0, survey, status }) => {
  const Components = useVulcanComponents();
  const surveyStatus = statusesReverse[survey?.status];
  return (
    <li className="response-item">
      <h4 className="response-item-survey">
        <Link href={pagePath}>
          <a>
            {survey.name} {survey.year}
          </a>
        </Link>
        <span className={`survey-status survey-status-${surveyStatus}`}>
          <Components.FormattedMessage
            id={`general.survey_status_${surveyStatus}`}
          />
        </span>
      </h4>
      <div className="response-item-details">
        <Components.FormattedMessage
          id="response.details"
          values={{ startedAt: createdAt.substr(0, 10), completion }}
        />{" "}
        {survey.resultsUrl && (
          <a href={survey.resultsUrl}>
            <Components.FormattedMessage id="response.view_results" />
          </a>
        )}
      </div>
    </li>
  );
};

export default UserResponses;
