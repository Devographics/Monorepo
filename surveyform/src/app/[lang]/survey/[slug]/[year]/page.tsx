import Support from "~/components/common/Support";
import { getEditionImageUrl } from "~/lib/surveys/helpers/getEditionImageUrl";
import { rscMustGetSurveyEditionFromUrl } from "./rsc-fetchers";
import { DebugRSC } from "~/components/debug/DebugRSC";
import Faq from "~/components/common/Faq";
import Translators from "~/components/common/Translators";

import SurveyCredits from "~/components/surveys/SurveyCredits";
import EditionMessage from "~/components/surveys/SurveyMessage";

import { type EditionMetadata } from "@devographics/types";
import { EditionMain } from "./client-components";

import TokyoDev from "~/components/common/TokyoDev";
import { DynamicT } from "@devographics/react-i18n";

// revalidating is important so we get fresh values from the cache every now and then without having to redeploy
export const revalidate = 54000; // 15mn
export const dynamicParams = true;
/**
 * NOTE: ideally we would load surveys in the layout directly
 * but this is not possible to mix static and dynamic pages in the same parent layout (yet)
 * @see https://github.com/vercel/next.js/issues/44712
 */
/*
FIXME weird bug it gives 404 on unknown languages...
export async function generateStaticParams() {
  const editionParams = (
    await rscGetEditionsMetadata({ removeHidden: true })
  ).map((e) => getEditionParams(e));
  // lang should be added too, for the moment we only statically render en-US but more could be added
  return editionParams.map((p) => ({ ...p, lang: "en-US" }));
}*/

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
        {/**
         * If moving to a client component,
         * we can use a token expression instead "general.{{editionId}}.survey_intro"
         */}
        <DynamicT token={`general.${edition.id}.survey_intro`} />
        <EditionMain edition={edition} />
      </div>
      <Faq edition={edition} />
      <SurveyCredits edition={edition} />
      <TokyoDev />
      <Translators />
    </div>
  );
};

export default async function SurveyPage(props: {
  params: Promise<SurveyPageServerProps>;
}) {
  const params = await props.params;
  const { slug, year } = params;
  const { data: edition, ___metadata: ___rscMustGetSurveyEditionFromUrl } =
    await rscMustGetSurveyEditionFromUrl({
      slug,
      year,
    });

  const imageUrl = getEditionImageUrl(edition);
  return (
    <div>
      <DebugRSC {...{ ___rscMustGetSurveyEditionFromUrl }} />
      <EditionPageComponent edition={edition} imageUrl={imageUrl} />
      {edition.survey.partners && <Support edition={edition} />}
    </div>
  );
}
