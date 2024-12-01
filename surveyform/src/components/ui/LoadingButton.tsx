import React, { CSSProperties } from "react";
import { Button, ButtonProps } from "./Button";
import { Loading } from "./Loading";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  label?: string | React.ReactNode;
}
export const LoadingButton = ({
  loading,
  label,
  children,
  className = "",
  variant,
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
      className={[
        "loading-button",
        loading ? "loading-button-loading" : "loading-button-notloading",
        className,
      ].join(" ")}
      variant={variant}
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
