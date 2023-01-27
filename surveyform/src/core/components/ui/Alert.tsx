import React from "react";
import { Alert as BootstrapAlert } from "react-bootstrap";

export const Alert = ({ children, variant = "danger", ...rest }) => (
  <BootstrapAlert variant={variant} {...rest}>
    {children}
  </BootstrapAlert>
);
