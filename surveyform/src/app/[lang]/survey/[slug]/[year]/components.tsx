import SurveyMessage from "~/surveys/components/SurveyMessage";
import SurveyCredits from "~/surveys/components/SurveyCredits";
import Image from "next/image";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { SurveyEdition, SURVEY_OPEN } from "@devographics/core-models";
import Translators from "~/core/components/common/Translators";
import Faq from "~/core/components/common/Faq";
import SurveyAction from "~/surveys/components/page/SurveyAction";
import { LoginDialog } from "~/account/LoginDialog";
import { Loading } from "~/core/components/ui/Loading";
import { getCurrentUser } from "./[responseId]/fetchers";
import { Suspense } from "react";

export const SurveyMain = ({ survey }: { survey: SurveyEdition }) => {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center" }}>
          <Loading />
        </div>
      }
    >
      {/** @see https://github.com/vercel/app-playground/blob/afa2a63c4abd2d99687cf002d76647a183bdcb78/app/streaming/_components/pricing.tsx */}
      {/** @ts-expect-error This an experimental syntax TS will cringe at async components */}
      <SurveyMainAsync survey={survey} />
    </Suspense>
  );
};

const SurveyMainAsync = async ({ survey }: { survey: SurveyEdition }) => {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <LoginDialog hideGuest={survey.status !== SURVEY_OPEN} user={user} />
    );
  } else {
    return (
      <>
        <SurveyAction survey={survey} />
      </>
    );
  }
};

export const SurveyPage = ({
  survey,
  surveyIntro,
  imageUrl,
}: {
  survey: SurveyEdition;
  surveyIntro: string;
  imageUrl: string;
}) => {
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
        <div
          className="survey-intro"
          // TODO: it should not be needed anymore?
          dangerouslySetInnerHTML={{
            __html: surveyIntro,
          }}
        />
        <SurveyMain survey={survey} />
      </div>
      <Faq survey={survey} />
      {survey.credits && <SurveyCredits survey={survey} />}
      <Translators />
    </div>
  );
};
