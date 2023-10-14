"use client";
import { useState } from "react";

export const LoadingButton = ({
  as = "button",
  action,
  label,
  tooltip,
}: {
  as?: "a" | "button";
  action: any;
  label: string;
  tooltip?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const Element = as;
  const WrapperElement = as === "a" ? "span" : "div";
  const extraProps = as === "a" ? { role: "button", href: "#" } : {};
  return (
    <WrapperElement
      className="loading-button"
      {...(tooltip ? { "data-tooltip": tooltip } : {})}
    >
      <Element
        {...extraProps}
        aria-busy={loading}
        onClick={async (e) => {
          e.preventDefault();
          setLoading(true);
          await action();
          setLoading(false);
        }}
      >
        {label}
      </Element>
    </WrapperElement>
  );
};

export default LoadingButton;
