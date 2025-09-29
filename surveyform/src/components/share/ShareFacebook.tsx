import ShareButton from "./ShareButton";

const ShareFacebook = ({
  link,
  quote = "",
}: //trackingId,
{
  link: string;
  quote?: string;
  //trackingId?: string;
}) => (
  <ShareButton
    id="facebook"
    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      link
    )}&quote=${encodeURIComponent(quote)}`}
  />
);

export default ShareFacebook;
