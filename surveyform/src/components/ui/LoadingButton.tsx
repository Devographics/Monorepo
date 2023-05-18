import React, { CSSProperties } from "react";
import { Button } from "./Button";
import { Loading } from "./Loading";
// @see https://stackoverflow.com/questions/51835611/specify-specific-props-and-accept-general-html-props-in-typescript-react-app
type ButtonProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  // The any is important here: we allow end-application to "hack" the component with a custom replacement implementation,
  // so we authorize them to  pass additionnal unknown props
  any;

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  label?: string | React.ReactNode;
  onClick?: any;
  children?: React.ReactNode;
  className?: string;
}
export const LoadingButton = ({
  loading,
  label,
  onClick,
  children,
  className = "",
  ...rest
}: LoadingButtonProps & any) => {
  const wrapperStyle: CSSProperties = {
    position: "relative",
  };

  const labelStyle = loading ? { opacity: 0.5 } : {};

  const loadingStyle: CSSProperties = loading
    ? {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }
    : { display: "none" };

  return (
    <Button
      className={`loading-button ${
        loading ? "loading-button-loading" : "loading-button-notloading"
      } ${className}`}
      onClick={onClick}
      {...rest}
    >
      <span style={wrapperStyle} className="loading-button-inner">
        <span style={labelStyle} className="loading-button-label">
          {label || children}
        </span>
        <span style={loadingStyle} className="loading-button-loader">
          <Loading />
        </span>
      </span>
    </Button>
  );
};
