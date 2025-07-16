import { Entity } from "@devographics/types";
import {
  LimitedAvailability,
  NewlyAvailable,
  WidelyAvailable,
} from "@devographics/icons";
import "./BaselineLabel.scss";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { T } from "@devographics/react-i18n";

const statuses = {
  high: { icon: WidelyAvailable, id: "widely_available" },
  low: { icon: NewlyAvailable, id: "newly_available" },
  false: { icon: LimitedAvailability, id: "limited_availability" },
};

export const BaselineLabel = ({ entity }: { entity?: Entity }) => {
  const webFeature = entity?.webFeature;
  const baselineStatus = webFeature?.status?.baseline;
  if (!baselineStatus) {
    return null;
  }
  const { icon, id } = statuses[baselineStatus];
  const { url } = webFeature;
  const Icon = icon;
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="general.skip_question.description">
          <T token={"baseline.baseline"} />{" "}
          <T token={`baseline.support.${baselineStatus}`} />
        </Tooltip>
      }
    >
      <a href={url} target="_blank" rel="noreferrer" className="baseline-icon">
        <Icon />
      </a>
    </OverlayTrigger>
  );
};

export default BaselineLabel;
