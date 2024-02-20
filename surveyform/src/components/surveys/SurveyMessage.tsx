import { FormattedMessage } from "~/components/common/FormattedMessage";
import { EditionMetadata, ResultsStatusEnum } from "@devographics/types";
import { SurveyStatusEnum } from "@devographics/types";

const EditionMessage = ({ edition }: { edition: EditionMetadata }) => {
  const { status, resultsStatus, resultsUrl, endedAt, feedbackUrl } = edition;
  switch (status) {
    case SurveyStatusEnum.PREVIEW:
    case SurveyStatusEnum.HIDDEN:
      return (
        <div className="survey-message survey-preview">
          <FormattedMessage id="general.survey_preview" />
          {feedbackUrl && (
            <>
              {" "}
              <a href={feedbackUrl} target="_blank">
                <FormattedMessage id="general.survey_feedback" />
              </a>
            </>
          )}
        </div>
      );
    case SurveyStatusEnum.CLOSED:
      return (
        <div className="survey-message survey-closed">
          <FormattedMessage
            id="general.survey_closed_on"
            values={{ endedAt }}
          />
          {resultsStatus === ResultsStatusEnum.PUBLISHED && (
            <span>
              {" "}
              <a href={resultsUrl}>
                <FormattedMessage id="general.survey_results" />
              </a>
            </span>
          )}
        </div>
      );
    default:
      return null;
  }
};

export default EditionMessage;
