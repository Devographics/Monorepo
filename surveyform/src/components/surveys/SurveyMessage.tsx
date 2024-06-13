import { EditionMetadata, ResultsStatusEnum } from "@devographics/types";
import { SurveyStatusEnum } from "@devographics/types";
import { tokens } from "./SurveyMessage.tokens";
import { teapot } from "@devographics/react-i18n";

const { T } = teapot(tokens)

const EditionMessage = ({ edition }: { edition: EditionMetadata }) => {
  const { status, resultsStatus, resultsUrl, endedAt, feedbackUrl } = edition;
  switch (status) {
    case SurveyStatusEnum.PREVIEW:
    case SurveyStatusEnum.HIDDEN:
      return (
        <div className="survey-message survey-preview">
          <T token="general.survey_preview" />
          {feedbackUrl && (
            <>
              {" "}
              <a href={feedbackUrl} target="_blank">
                <T token="general.survey_feedback" />
              </a>
            </>
          )}
        </div>
      );
    case SurveyStatusEnum.CLOSED:
      return (
        <div className="survey-message survey-closed">
          <T
            token="general.survey_closed_on"
            values={{ endedAt }}
          />
          {resultsStatus === ResultsStatusEnum.PUBLISHED && (
            <span>
              {" "}
              <a href={resultsUrl}>
                <T token="general.survey_results" />
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
