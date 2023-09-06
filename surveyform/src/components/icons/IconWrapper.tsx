"use client";

import Tooltip from "react-bootstrap/Tooltip";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useIntlContext } from "@devographics/react-i18n";
import { ReactNode } from "react";
import { Button } from "~/components/ui/Button";

export interface IconProps {
  label?: string;
  labelId?: string;
  enableTooltip?: boolean;
  isButton?: boolean;
  values?: any;
  onClick?: any;
  className?: string;
}

export interface IconWrapperProps extends IconProps {
  children: ReactNode;
}

export const IconWrapper = (props: IconWrapperProps & any) => {
  const intl = useIntlContext();

  const {
    enableTooltip = false,
    isButton = false,
    labelId,
    label,
    children,
    values,
    onClick,
    className = "",
  } = props;

  const label_ =
    label || (labelId && intl.formatMessage({ id: labelId, values }));

  const icon = (
    <span className={`icon-wrapper ${className}`}>
      {isButton ? <Button onClick={onClick}>{children}</Button> : children}
      <span className="sr-only">{label_}</span>
    </span>
  );

  return enableTooltip ? (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={labelId}>{label_}</Tooltip>}
    >
      {icon}
    </OverlayTrigger>
  ) : (
    icon
  );
};

export default IconWrapper;
