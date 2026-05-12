import React from "react";
import ShareButton from "./ShareButton";

const ShareTwitter = ({
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
    id="twitter"
    href={`https://twitter.com/intent/tweet/?text=${encodeURIComponent(text)}`}
  />
);

export default ShareTwitter;
