import EditionMessage from "~/surveys/components/SurveyMessage";
import SurveyCredits from "~/surveys/components/SurveyCredits";
import Image from "next/image";
import { FormattedMessage } from "~/core/components/common/FormattedMessage";
import { SURVEY_OPEN } from "@devographics/core-models";
import Translators from "~/core/components/common/Translators";
import Faq from "~/core/components/common/Faq";
import EditionAction from "~/surveys/components/page/SurveyAction";
import { LoginDialog } from "~/account/LoginDialog";
import { Loading } from "~/core/components/ui/Loading";
import { getCurrentUser } from "./[responseId]/fetchers";
import { Suspense } from "react";
import { EditionMetadata } from "@devographics/types";

export const EditionMain = ({ edition }: { edition: EditionMetadata }) => {
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
      <EditionMainAsync edition={edition} />
    </Suspense>
  );
};

const EditionMainAsync = async ({ edition }: { edition: EditionMetadata }) => {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <LoginDialog hideGuest={edition.status !== SURVEY_OPEN} user={user} />
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
}: {
  edition: EditionMetadata;
  editionIntro: string;
  imageUrl?: string;
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
          <Image
            // TODO: width and height are not the wanted size, but a hint to help next optimize the size
            // investigate using "probe" instead
            width={600}
            height={400}
            priority={true}
            src={imageUrl}
            alt={`${name} ${edition.year}`}
            quality={100}
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
        <EditionMain edition={edition} />
      </div>
      <Faq survey={edition} />
      {edition.credits && <SurveyCredits survey={edition} />}
      <Translators />
    </div>
  );
};
