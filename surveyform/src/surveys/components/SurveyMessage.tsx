import React from "react";
import { statuses } from "~/surveys/constants";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";

const SurveyMessage = ({ survey }) => {
  const { status } = survey;
  switch (status) {
    case statuses.preview:
      return (
        <div className="survey-message survey-preview">
          <FormattedMessage id="general.survey_preview" />
        </div>
      );
    case statuses.closed:
      return (
        <div className="survey-message survey-closed">
          <FormattedMessage id="general.survey_closed" />
        </div>
      );
    default:
      return null;
  }
};

export default SurveyMessage;
