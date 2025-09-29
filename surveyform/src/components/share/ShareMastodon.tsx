import React from "react";
import { useI18n } from "@devographics/react-i18n";
import ShareButton from "./ShareButton";

const ShareMastodon = ({
  text,
  trackingId,
}: {
  text: string;
  trackingId?: string;
}) => (
  <ShareButton
    id="mastodon"
    href={`https://tootpick.org/#text=${encodeURIComponent(text)}
`}
  />
);

export default ShareMastodon;
