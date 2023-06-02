import { FormattedMessage } from "~/components/common/FormattedMessage";
import { EditionMetadata } from "@devographics/types";
import { SurveyStatusEnum } from "@devographics/types";

const EditionMessage = ({ edition }: { edition: EditionMetadata }) => {
  const { status } = edition;
  switch (status) {
    case SurveyStatusEnum.PREVIEW:
      return (
        <div className="survey-message survey-preview">
          <FormattedMessage id="general.survey_preview" />
        </div>
      );
    case SurveyStatusEnum.CLOSED:
      return (
        <div className="survey-message survey-closed">
          <FormattedMessage id="general.survey_closed" />
        </div>
      );
    default:
      return null;
  }
};

export default EditionMessage;
