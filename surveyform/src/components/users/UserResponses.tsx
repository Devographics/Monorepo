import Link from "next/link";
import {
  SurveyMetadata,
  SurveyStatusEnum,
  ResponseDocument,
} from "@devographics/types";
import { T, useI18n } from "@devographics/react-i18n";
import { UserDocument } from "~/lib/users/typings";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { ResponseDetails } from "../surveys/ResponseDetails";

const UserResponses = ({
  surveys,
  localeId,
  responses,
  user,
}: {
  surveys: SurveyMetadata[];
  localeId: string;
  responses: Array<ResponseDocument>;
  user: UserDocument;
}) => {
  return (
    <div>
      <div>
        <h3>
          <T token="accounts.your_surveys" />
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
          <T token="account.past_surveys" />
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
    survey: edition.survey,
    response,
    locale: { id: localeId },
  });
  const surveyStatus = SurveyStatusEnum[status].toLowerCase();
  return (
    <li className="user-response-item">
      <h4 className="user-response-item-survey">
        <Link href={pagePath}>
          {survey.name} {year}
        </Link>
        <span className={`survey-status survey-status-${surveyStatus}`}>
          <T token={`general.survey_status_${surveyStatus}`} />
        </span>
      </h4>
      <ResponseDetails edition={edition} response={response} />
    </li>
  );
};

export default UserResponses;
