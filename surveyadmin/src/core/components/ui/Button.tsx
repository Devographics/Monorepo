import {
  Button as BootstrapButton,
  ButtonProps as BootstrapButtonProps,
} from "react-bootstrap";

export type ButtonProps = BootstrapButtonProps;
export const Button = (props) => <BootstrapButton {...props} />;
