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
    <button
      aria-busy={loading}
      onClick={async () => {
        setLoading(true);
        await action();
        setLoading(false);
      }}
      {...(tooltip ? { "data-tooltip": tooltip } : {})}
    >
      {label}
    </button>
  );
};

export default LoadingButton;
