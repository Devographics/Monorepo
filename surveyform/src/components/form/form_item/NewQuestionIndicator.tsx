import { T, useI18n } from "@devographics/react-i18n";

import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

export const NewQuestionIndicator = () => {
  const { t } = useI18n();
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="general.newly_added">
          <T token="general.newly_added" />
        </Tooltip>
      }
    >
      <span className="question-label-new" title={t("general.newly_added")}>
        ✨
      </span>
    </OverlayTrigger>
  );
};
