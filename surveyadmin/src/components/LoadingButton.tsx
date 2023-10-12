import { useState } from "react";

export const LoadingButton = ({
  action,
  label,
  tooltip,
}: {
  action: any;
  label: string;
  tooltip?: string;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <div
      className="loading-button"
      {...(tooltip ? { "data-tooltip": tooltip } : {})}
    >
      <button
        aria-busy={loading}
        onClick={async () => {
          setLoading(true);
          await action();
          setLoading(false);
        }}
      >
        {label}
      </button>
    </div>
  );
};

export default LoadingButton;
