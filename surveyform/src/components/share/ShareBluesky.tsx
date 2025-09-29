import ShareButton from "./ShareButton";

const ShareBluesky = ({
  text,
  trackingId,
}: {
  text: string;
  trackingId?: string;
}) => (
  <ShareButton
    id="bluesky"
    href={`https://bsky.app/intent/compose/?text=${encodeURIComponent(text)}`}
  />
);

export default ShareBluesky;
