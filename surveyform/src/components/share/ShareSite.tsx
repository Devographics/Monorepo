"use client";
import ShareTwitter from "./ShareTwitter";
import ShareEmail from "./ShareEmail";
import ShareFacebook from "./ShareFacebook";
import ShareLinkedIn from "./ShareLinkedIn";
import { useI18n } from "@devographics/react-i18n";
import { getEditionTitle } from "~/lib/surveys/helpers/getEditionTitle";
import ShareBluesky from "./ShareBluesky";

const ShareSite = ({ edition }) => {
  const { t } = useI18n();
  const { questionsUrl } = edition;
  const getLink = (source) =>
    `${questionsUrl}?source=post_survey_share_${source}`;
  const surveyName = getEditionTitle({ edition });
  const getValues = (source) => ({ surveyName, link: getLink(source) });
  const getTitle = (source) => t("general.share_subject", getValues(source));
  const getBody = (source) => t("general.share_text", getValues(source));

  return (
    <div className="ShareSite">
      <div className="ShareSite__Content">
        <ShareTwitter text={getBody("twitter")} />
        <ShareBluesky text={getBody("bluesky")} />
        <ShareFacebook link={getLink("facebook")} quote={getBody("facebook")} />
        <ShareLinkedIn
          link={getLink("linkedin")}
          title={getTitle("linkedin")}
        />
        <ShareEmail subject={getTitle("email")} body={getBody("email")} />
      </div>
    </div>
  );
};

export default ShareSite;
