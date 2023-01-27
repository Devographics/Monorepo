import React from "react";
import { Button, ButtonProps } from "./Button";
import { Loading } from "./Loading";
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
  return (
    <Button
      className={`loading-button ${
        loading ? "loading-button-loading" : "loading-button-notloading"
      } ${className}`}
      onClick={onClick}
      {...rest}
    >
      <span className="loading-button-inner">
        <span className="loading-button-label">{label || children}</span>
        <span className="loading-button-loader">
          <Loading />
        </span>
      </span>
    </Button>
  );
};
