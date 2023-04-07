import SurveyMessage from "~/surveys/components/SurveyMessage";
import SurveyCredits from "~/surveys/components/SurveyCredits";
import Image from "next/image";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { SurveyEdition } from "@devographics/core-models";
import { SurveyMain } from "./components.client";
import Translators from "~/core/components/common/Translators";
import Faq from "~/core/components/common/Faq";

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
