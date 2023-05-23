import Link from "next/link";
import { SurveyMetadata, SurveyStatusEnum } from "@devographics/types";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { ResponseDocument, SurveyEdition } from "@devographics/core-models";
import { UserDocument } from "~/account/user/typings";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { getEditionSectionPath } from "~/lib/surveys/helpers";

const UserResponses = async ({
  localeId,
  responses,
  user,
}: {
  localeId: string;
  responses: Array<ResponseDocument>;
  user: UserDocument;
}) => {
  const surveys = await fetchSurveysMetadata({ calledFrom: "UserResponses" });

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
              <ResponseItem
                key={response._id}
                response={response}
                surveys={surveys}
                localeId={localeId}
              />
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
  response,
  surveys,
  localeId,
}: {
  response: ResponseDocument;
  surveys?: SurveyMetadata[];
  localeId: string;
}) => {
  const { surveyId, editionId, createdAt, completion } = response;
  const survey = surveys?.find((s) => s.id === surveyId);
  if (!survey) {
    return null;
  }
  const edition = survey.editions?.find((e) => e.id === editionId);
  if (!edition) {
    return null;
  }
  const { status, year, resultsUrl } = edition;

  edition.survey = survey;

  const pagePath = getEditionSectionPath({
    edition,
    response,
    locale: { id: localeId },
  });
  const surveyStatus = SurveyStatusEnum[status].toLowerCase();
  return (
    <li className="response-item">
      <h4 className="response-item-survey">
        <Link href={pagePath}>
          {survey.name} {year}
        </Link>
        <span className={`survey-status survey-status-${surveyStatus}`}>
          <FormattedMessage id={`general.survey_status_${surveyStatus}`} />
        </span>
      </h4>
      <div className="response-item-details">
        <FormattedMessage
          id="response.details"
          // TODO: not sure if createdAt is a string or Date here
          values={{ startedAt: String(createdAt).substring(0, 10), completion }}
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
