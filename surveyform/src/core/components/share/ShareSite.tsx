import React from "react";
import ShareTwitter from "./ShareTwitter";
import ShareEmail from "./ShareEmail";
import ShareFacebook from "./ShareFacebook";
import ShareLinkedIn from "./ShareLinkedIn";
import { useIntlContext } from "@vulcanjs/react-i18n";

const ShareSite = ({ survey }) => {
  const intl = useIntlContext();
  const { name, year, hashtag, shareUrl: link } = survey;
  const surveyName = `${name} ${year}`;
  const values = { surveyName, link };
  const title = intl.formatMessage({ id: "general.share_subject" }, values);
  const body = intl.formatMessage({ id: "general.share_text" }, values);
  const twitterText = body + `#${hashtag}`;

  return (
    <div className="ShareSite">
      <div className="ShareSite__Content">
        <ShareTwitter text={twitterText} />
        <ShareFacebook link={link} quote={body} />
        <ShareLinkedIn link={link} title={title} />
        <ShareEmail subject={title} body={body} />
      </div>
    </div>
  );
};

export default ShareSite;
