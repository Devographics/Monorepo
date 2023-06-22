"use client";
import ShareTwitter from "./ShareTwitter";
import ShareEmail from "./ShareEmail";
import ShareFacebook from "./ShareFacebook";
import ShareLinkedIn from "./ShareLinkedIn";
import { useIntlContext } from "@devographics/react-i18n";
import { getEditionTitle } from "~/lib/surveys/helpers";

const ShareSite = ({ edition }) => {
  const intl = useIntlContext();
  const { questionsUrl } = edition;
  const link = `${questionsUrl}?source=post_survey_share`;
  const surveyName = getEditionTitle({ edition });
  const values = { surveyName, link };
  const title = intl.formatMessage({ id: "general.share_subject", values });
  const body = intl.formatMessage({ id: "general.share_text", values });

  return (
    <div className="ShareSite">
      <div className="ShareSite__Content">
        <ShareTwitter text={body} />
        <ShareFacebook link={link} quote={body} />
        <ShareLinkedIn link={link} title={title} />
        <ShareEmail subject={title} body={body} />
      </div>
    </div>
  );
};

export default ShareSite;
