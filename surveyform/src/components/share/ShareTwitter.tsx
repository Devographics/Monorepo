import React from "react";
import ShareButton from "./ShareButton";

const ShareTwitter = ({
  text,
  trackingId,
}: {
  text: string;
  trackingId?: string;
}) => (
  <ShareButton
    id="twitter"
    href={`https://twitter.com/intent/tweet/?text=${encodeURIComponent(text)}`}
  />
);

export default ShareTwitter;
