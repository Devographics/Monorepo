import React from "react";
import ShareButton from "./ShareButton";

const ShareX = ({
  text,
  trackingId,
  showLabel,
}: {
  text: string;
  trackingId?: string;
  showLabel?: boolean;
}) => (
  <ShareButton
    showLabel={showLabel}
    id="x"
    href={`https://x.com/intent/tweet/?text=${encodeURIComponent(text)}`}
  />
);

export default ShareX;
