"use client";
import SurveyAction from "~/surveys/components/page/SurveyAction";
import LoginDialog from "~/account/LoginDialog";
import { useUser } from "~/account/user/hooks";
import { Loading } from "~/core/components/ui/Loading";
import { SurveyEdition, SURVEY_OPEN } from "@devographics/core-models";

export const SurveyMain = ({ survey }: { survey: SurveyEdition }) => {
  const { user, loading: currentUserLoading } = useUser();
  if (currentUserLoading) return <Loading />;
  if (!user) {
    return <LoginDialog hideGuest={survey.status !== SURVEY_OPEN} />;
  } else {
    return (
      <>
        <SurveyAction survey={survey} />
      </>
    );
  }
};
