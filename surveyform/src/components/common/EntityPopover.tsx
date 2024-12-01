import { Entity } from "@devographics/types";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { Code } from "../icons";
import { CodeExample } from "../inputs/experience/Experience2";
import { ReactNode, useState } from "react";

export const EntityPopoverTrigger = ({
  label,
  entity,
}: {
  label: ReactNode;
  entity: Entity;
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  return (
    <OverlayTrigger
      // trigger="click"
      placement="top"
      show={showOverlay}
      overlay={
        <Popover id="popover-basic" className="entity-popover">
          <Popover.Header as="h3">{label}</Popover.Header>
          <Popover.Body>
            {entity?.example?.code && <CodeExample {...entity.example} />}
          </Popover.Body>
        </Popover>
      }
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          setShowOverlay(!showOverlay);
        }}
        onMouseEnter={() => {
          setShowOverlay(true);
        }}
        onMouseLeave={() => {
          setShowOverlay(false);
        }}
        className="entity-popover-trigger btn-invisible"
      >
        <Code labelId="entity.learn_more" />
      </button>
    </OverlayTrigger>
  );
};

export default EntityPopoverTrigger;
