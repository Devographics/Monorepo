import EditionMessage from "~/components/surveys/SurveyMessage";
import SurveyCredits from "~/components/surveys/SurveyCredits";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import Translators from "~/components/common/Translators";
import Faq from "~/components/common/Faq";
import EditionAction from "~/components/page/SurveyAction";
import { LoginDialog } from "~/account/LoginDialog";
import { Loading } from "~/components/ui/Loading";
import { Suspense } from "react";
import { EditionMetadata, SurveyStatusEnum } from "@devographics/types";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { CenteredContainer } from "~/components/ui/CenteredContainer";

export const EditionMain = ({
  edition,
  editionPath,
}: {
  edition: EditionMetadata;
  editionPath?: string;
}) => {
  return (
    <Suspense
      // TODO: how come this is not centered?
      fallback={
        <CenteredContainer>
          <Loading />
        </CenteredContainer>
      }
    >
      {/** @see https://github.com/vercel/app-playground/blob/afa2a63c4abd2d99687cf002d76647a183bdcb78/app/streaming/_components/pricing.tsx */}
      {/** @ts-expect-error This an experimental syntax TS will cringe at async components */}
      <EditionMainAsync edition={edition} editionPath={editionPath} />
    </Suspense>
  );
};

const EditionMainAsync = async ({
  edition,
  editionPath,
}: {
  edition: EditionMetadata;
  editionPath?: string;
}) => {
  const user = await rscCurrentUser();
  if (!user) {
    return (
      <LoginDialog
        editionId={edition.id}
        surveyId={edition.surveyId}
        hideGuest={edition.status === SurveyStatusEnum.CLOSED}
        user={user}
        successRedirectionPath={editionPath}
      />
    );
  } else {
    return (
      <>
        <EditionAction edition={edition} />
      </>
    );
  }
};

export const EditionPage = ({
  edition,
  editionIntro,
  imageUrl,
  editionPath,
}: {
  edition: EditionMetadata;
  editionIntro: string;
  imageUrl?: string;
  editionPath?: string;
}) => {
  const { resultsUrl, survey } = edition;
  const { name } = survey;
  return (
    <div className="survey-page contents-narrow">
      <EditionMessage edition={edition} />

      {resultsUrl && (
        <div className="survey-results">
          <a href={resultsUrl} target="_blank" rel="noreferrer noopener">
            <FormattedMessage id="general.survey_results" />
          </a>
        </div>
      )}

      {!!imageUrl && (
        <h1 className="survey-image">
          <img
            width={600}
            height={400}
            src={imageUrl}
            alt={`${name} ${edition.year}`}
          />
        </h1>
      )}
      <div className="survey-page-block">
        <div
          className="survey-intro"
          // TODO: it should not be needed anymore?
          dangerouslySetInnerHTML={{
            __html: editionIntro,
          }}
        />
        <EditionMain edition={edition} editionPath={editionPath} />
      </div>
      <Faq survey={edition} />
      {edition.credits && <SurveyCredits edition={edition} />}
      <Translators />
    </div>
  );
};
