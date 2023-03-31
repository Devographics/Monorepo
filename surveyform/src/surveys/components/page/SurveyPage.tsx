"use client";
// TODO: we need to enable accounts back
// import { STATES } from "meteor/vulcan:accounts";
// import AccountMessage from "../../users/AccountMessage";
import SurveyAction from "./SurveyAction";
import SurveyMessage from "../SurveyMessage";
import SurveyCredits from "../SurveyCredits";
import Translators from "~/core/components/common/Translators";
import Faq from "~/core/components/common/Faq";
import { useIntlContext } from "@devographics/react-i18n";
import LoginDialog from "~/account/LoginDialog";
import { useUser } from "~/account/user/hooks";
import Image from "next/image";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { Loading } from "~/core/components/ui/Loading";
import { useSurvey } from "../SurveyContext/Provider";
import { SurveyEdition, SURVEY_OPEN } from "@devographics/core-models";

const SurveyPageWrapper = ({ imageUrl }: { imageUrl: string }) => {
  const survey = useSurvey();
  const { name, resultsUrl } = survey;

  return (
    <div className="survey-page contents-narrow">
      <SurveyMessage survey={survey} />

      {resultsUrl && (
        <div className="survey-results">
          <a href={resultsUrl} target="_blank" rel="noreferrer noopener">
            <FormattedMessage id="general.survey_results" />
          </a>
        </div>
      )}

      <h1 className="survey-image">
        <Image
          width={600}
          height={400}
          priority={true}
          src={imageUrl}
          alt={`${name} ${survey.year}`}
          quality={100}
        />
      </h1>
      <div className="survey-page-block">
        <SurveyMain survey={survey} />
      </div>
      <Faq survey={survey} />
      {survey.credits && <SurveyCredits survey={survey} />}
      <Translators />
    </div>
  );
};

const SurveyIntro = ({ survey }) => {
  const intl = useIntlContext();
  return (
    <div
      className="survey-intro"
      dangerouslySetInnerHTML={{
        __html: intl.formatMessage({
          id: `general.${survey.slug}.survey_intro`,
        }),
      }}
    />
  );
};

const SurveyMain = ({ survey }: { survey: SurveyEdition }) => {
  const { user, loading: currentUserLoading } = useUser();
  if (currentUserLoading) return <Loading />;
  if (!user) {
    return <LoginDialog hideGuest={survey.status !== SURVEY_OPEN} />;
  } else {
    return (
      <>
        <SurveyIntro survey={survey} />
        <SurveyAction survey={survey} currentUser={user} />
      </>
    );
  }
};

export default SurveyPageWrapper;
