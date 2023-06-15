import BootstrapAlert from "react-bootstrap/Alert";

export const Alert = ({ children, variant = "danger", ...rest }) => (
  <BootstrapAlert variant={variant} {...rest}>
    {children}
  </BootstrapAlert>
);
