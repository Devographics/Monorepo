import React, { CSSProperties } from "react";
import { useVulcanComponents } from "../VulcanComponents/Consumer";
import type { ButtonProps } from "./typings";
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
  const Components = useVulcanComponents();

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
    <Components.Button
      className={`loading-button ${loading ? "loading-button-loading" : "loading-button-notloading"
        } ${className}`}
      onClick={onClick}
      {...rest}
    >
      <span style={wrapperStyle} className="loading-button-inner">
        <span style={labelStyle} className="loading-button-label">{label || children}</span>
        <span style={loadingStyle} className="loading-button-loader">
          <Components.Loading />
        </span>
      </span>
    </Components.Button>
  );
};
