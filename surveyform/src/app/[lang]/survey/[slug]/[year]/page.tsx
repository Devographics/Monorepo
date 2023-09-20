import Support from "~/components/common/Support";
import { getSurveyImageUrl } from "~/lib/surveys/helpers/getSurveyImageUrl";
import { rscMustGetSurveyEditionFromUrl } from "./rsc-fetchers";
import { DebugRSC } from "~/components/debug/DebugRSC";
import Faq from "~/components/common/Faq";
import Translators from "~/components/common/Translators";
import SurveyCredits from "~/components/surveys/SurveyCredits";
import EditionMessage from "~/components/surveys/SurveyMessage";
import { FormattedMessage } from "~/components/common/FormattedMessage";
import { EditionMetadata } from "@devographics/types";
import { EditionMain } from "./client-components";
import { rscFetchSurveysMetadata } from "~/lib/surveys/rsc-fetchers";

/**
 * NOTE: ideally we would load surveys in the layout directly
 * but this is not possible to mix static and dynamic pages in the same parent layout (yet)
 * @see https://github.com/vercel/next.js/issues/44712
 */
export async function generateStaticParams() {
  const surveys = (await rscFetchSurveysMetadata())?.data || [];
  const editions = surveys.map((s) => s.editions).flat();
  return (
    editions.map((e) => ({
      slug: e.surveyId.replaceAll("_", "-"),
      year: String(e.year),
    })) || []
  );
}

interface SurveyPageServerProps {
  slug: string;
  year: string;
  // inherited from above segment
  lang: string;
}

const EditionPageComponent = ({
  edition,
  imageUrl,
}: {
  edition: EditionMetadata;
  imageUrl?: string;
}) => {
  const { survey } = edition;
  const { name } = survey;
  return (
    <div className="survey-page contents-narrow">
      <EditionMessage edition={edition} />

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
        <FormattedMessage id={`general.${edition.id}.survey_intro`} />
        <EditionMain edition={edition} />
      </div>
      <Faq survey={edition} />
      {edition.credits && <SurveyCredits edition={edition} />}
      <Translators />
    </div>
  );
};

export default async function SurveyPage({
  params,
}: {
  params: SurveyPageServerProps;
}) {
  const { slug, year } = params;
  const { data: edition, ___metadata: ___rscMustGetSurveyEditionFromUrl } =
    await rscMustGetSurveyEditionFromUrl({
      slug,
      year,
    });
  const imageUrl = getSurveyImageUrl(edition);
  return (
    <div>
      <DebugRSC {...{ ___rscMustGetSurveyEditionFromUrl }} />
      <EditionPageComponent edition={edition} imageUrl={imageUrl} />
      {edition.survey.partners && <Support edition={edition} />}
    </div>
  );
}
