import ShareButton from "./ShareButton";

const ShareEmail = ({
  subject,
  body,
}: //trackingId,
{
  subject: string;
  body: string;
  //trackingId?: string;
}) => (
  <ShareButton
    id="email"
    href={`mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`}
  />
);

export default ShareEmail;
