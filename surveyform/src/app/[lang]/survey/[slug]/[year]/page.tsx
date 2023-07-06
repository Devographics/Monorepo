import Support from "~/components/common/Support";
import { getSurveyImageUrl } from "~/lib/surveys/helpers/getSurveyImageUrl";
import { EditionPage as EditionPageComponent } from "./components";
import { rscMustGetSurveyEditionFromUrl } from "./rsc-fetchers";

interface SurveyPageServerProps {
  slug: string;
  year: string;
  // inherited from above segment
  lang: string;
}

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: SurveyPageServerProps;
  searchParams: { "from-magic-login"?: string };
}) {
  const { slug, year, lang } = params;
  const edition = await rscMustGetSurveyEditionFromUrl({ slug, year });
  const imageUrl = getSurveyImageUrl(edition);
  return (
    <div>
      <EditionPageComponent
        edition={edition}
        imageUrl={imageUrl}
        editionPath={`/survey/${slug}/${year}`}
      />
      {edition.survey.partners && <Support edition={edition} />}
    </div>
  );
}
