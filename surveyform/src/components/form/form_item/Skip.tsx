import { T } from "@devographics/react-i18n";
import { Button } from "../../ui/Button";
import { Skip } from "../../icons";
import { Unskip } from "../../icons/Unskip";
import Tooltip from "react-bootstrap/Tooltip";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";

export const SkipButton = ({
  isSkipped,
  skipPath,
  updateCurrentValues,
}: {
  isSkipped: boolean;
  skipPath: string;
  updateCurrentValues: any;
}) => {
  const toggleSkipped = () => {
    updateCurrentValues({ [skipPath]: !isSkipped });
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="general.skip_question.description">
          <T
            token={
              isSkipped
                ? "general.unskip_question.description"
                : "general.skip_question.description"
            }
          />
        </Tooltip>
      }
    >
      <div className="skip-question">
        <Button
          size="sm"
          onClick={(e) => {
            toggleSkipped();
          }}
        >
          <T
            token={
              isSkipped ? "general.unskip_question" : "general.skip_question"
            }
          />
          {isSkipped ? <Unskip /> : <Skip />}
        </Button>
      </div>
    </OverlayTrigger>
  );
};
