"use client";
import EditionAction from "~/components/page/SurveyAction";
import { LoginDialog } from "~/account/LoginDialog";
import { Loading } from "~/components/ui/Loading";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";
import { CenteredContainer } from "~/components/ui/CenteredContainer";
import { useClientData } from "~/components/page/hooks";
import { useCurrentUser } from "~/lib/users/hooks";
import { getEditionSectionPath } from "~/lib/surveys/helpers/getEditionSectionPath";
import { useLocaleContext } from "~/i18n/context/LocaleContext";

export const EditionMain = ({ edition }: { edition: EditionMetadata }) => {
  const { locale } = useLocaleContext();
  const { currentUser, loading } = useCurrentUser();
  const clientData = useClientData({
    editionId: edition.id,
    surveyId: edition.survey.id,
  });
  if (loading) {
    return (
      <CenteredContainer>
        <Loading />
      </CenteredContainer>
    );
  }
  if (!currentUser) {
    return (
      <>
        {edition.status === SurveyStatusEnum.CLOSED && (
          <EditionAction edition={edition} />
        )}
        <LoginDialog
          editionId={edition.id}
          surveyId={edition.surveyId}
          hideGuest={edition.status === SurveyStatusEnum.CLOSED}
          user={currentUser}
          successRedirectionFunction={(res) => {
            const { response } = res;
            const path = getEditionSectionPath({
              edition,
              survey: edition.survey,
              locale,
              response,
            });
            return path;
          }}
          loginOptions={{ data: clientData, createResponse: true }}
        />
      </>
    );
  } else {
    return <EditionAction edition={edition} />;
  }
};
