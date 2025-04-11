"use client";
import { useState } from "react";

export const LoadingButton = ({
  as = "button",
  action,
  label,
  tooltip,
  className = "",
}: {
  as?: "a" | "button";
  action: any;
  label: string;
  tooltip?: string;
  className?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const Element = as;
  const WrapperElement = as === "a" ? "span" : "div";
  const extraProps = as === "a" ? { role: "button", href: "#" } : {};
  return (
    <>
      <WrapperElement
        className={`loading-button ${className}`}
        {...(tooltip ? { "data-tooltip": tooltip } : {})}
      >
        <Element
          {...extraProps}
          aria-busy={loading}
          onClick={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setSuccess(null);
            const result = await action();
            if (result?.error) {
              setError(result.error.message);
            }
            if (result?.success) {
              setSuccess(result.success);
            }
            setLoading(false);
          }}
        >
          {label}
        </Element>
      </WrapperElement>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </>
  );
};

export default LoadingButton;
