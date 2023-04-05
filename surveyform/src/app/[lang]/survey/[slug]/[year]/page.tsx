import SurveyPageComponent from "~/surveys/components/page/SurveyPage";
import Support from "~/core/components/common/Support";
import { mustGetSurvey } from "./fetchers";
import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";
import { initRedis } from "@devographics/core-models/server";
import { serverConfig } from "~/config/server";

interface SurveyPageServerProps {
  slug: string;
  year: string;
}
export default async function SurveyPage({
  params: { slug, year },
}: {
  params: SurveyPageServerProps;
}) {
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  initRedis(serverConfig().redisUrl);
  const survey = await mustGetSurvey({ slug, year });
  const imageUrl = getSurveyImageUrl(survey);
  return (
    <div>
      <SurveyPageComponent
        imageUrl={imageUrl} /*NOTE: currently it's a client component 
  so it gets the survey via client context instead of props*/
      />
      <Support />
    </div>
  );
}
