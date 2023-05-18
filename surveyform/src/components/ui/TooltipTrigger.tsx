/*

children: the content of the tooltip
trigger: the component that triggers the tooltip to appear

*/
import React from "react";
// import Tooltip from 'react-bootstrap/Tooltip';
// import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

/**
 * Display a tooltip when hovering an item
 */
export const TooltipTrigger = ({
  children,
  trigger,
  //placement = "top",
  //...rest
}) => {
  return <div title={children}>{trigger}</div>;
  /*
  const tooltip = <Tooltip id="tooltip">{children}</Tooltip>;

  return (
    <OverlayTrigger placement={placement} {...rest} overlay={tooltip}>
      {trigger}
    </OverlayTrigger>
  );*/
};
