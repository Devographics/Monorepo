"use client";
import SurveyAction from "~/surveys/components/page/SurveyAction";
import LoginDialog from "~/account/LoginDialog";
import { useUser } from "~/account/user/hooks";
import { Loading } from "~/core/components/ui/Loading";
import { SurveyEdition, SURVEY_OPEN } from "@devographics/core-models";
import { useIntlContext } from "@devographics/react-i18n";

// TODO: we can get the intro text from server instead
// reuse the same logic as in metadata
export const SurveyIntro = ({ survey }) => {
  const intl = useIntlContext();
  return (
    <div
      className="survey-intro"
      // TODO: it should not be needed anymore?
      dangerouslySetInnerHTML={{
        __html: intl.formatMessage({
          id: `general.${survey.slug}.survey_intro`,
        }),
      }}
    />
  );
};

export const SurveyMain = ({ survey }: { survey: SurveyEdition }) => {
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
