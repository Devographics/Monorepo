import { Entity } from "@devographics/types";
import { ExperimentalIcon } from "@devographics/icons";
import "./BaselineLabel.scss";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { T } from "@devographics/react-i18n";

export const ExperimentalLabel = ({ entity }: { entity?: Entity }) => {
  const isExperimental = entity?.isExperimental;
  if (!isExperimental) {
    return null;
  }
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip>
          <T token="feature.experimental" />
        </Tooltip>
      }
    >
      <span className="baseline-icon">
        <ExperimentalIcon size="petite" />
      </span>
    </OverlayTrigger>
  );
};

export default ExperimentalLabel;
