import ShareButton from "./ShareButton";

const ShareBluesky = ({
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
    id="bluesky"
    href={`https://bsky.app/intent/compose/?text=${encodeURIComponent(text)}`}
  />
);

export default ShareBluesky;
