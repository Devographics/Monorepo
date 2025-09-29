import React from "react";
import ShareButton from "./ShareButton";

const ShareLinkedIn = ({
  link,
  title,
  summary = "",
  trackingId,
}: {
  link: string;
  title: string;
  summary?: string;
  trackingId?: string;
}) => (
  <ShareButton
    id="linkedin"
    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      link
    )}&title=${title}&summary=${summary}`}
  />
);

export default ShareLinkedIn;
