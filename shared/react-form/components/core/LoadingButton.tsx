import React from "react";
import type { ButtonProps } from "./typings";
export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  label?: string | React.ReactNode;
  onClick?: any;
  children?: React.ReactNode;
  className?: string;
}
