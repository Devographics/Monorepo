import SurveyPageComponent from "~/surveys/components/page/SurveyPage";
import Support from "~/core/components/common/Support";
import { mustGetSurvey } from "./fetchers";
import { getSurveyImageUrl } from "~/surveys/getSurveyImageUrl";
import { initRedis } from "@devographics/core-models/server";
import { serverConfig } from "~/config/server";
import { getSurveyTitle } from "~/surveys/helpers";
import { publicConfig } from "~/config/public";

interface SurveyPageServerProps {
  slug: string;
  year: string;
}

// TODO: localized content still uses "next/head", see computeHeadTags
export default async function SurveyHead({
  params: { slug, year },
}: {
  params: SurveyPageServerProps;
}) {
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  initRedis(serverConfig().redisUrl);
  const survey = await mustGetSurvey({ slug, year });
  const { socialImageUrl, faviconUrl } = survey;
  const imageUrl = getSurveyImageUrl(survey);
  let imageAbsoluteUrl = socialImageUrl || imageUrl;
  const url = publicConfig.appUrl;
  return (
    <>
      {/** meta */}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/** OpenGraph */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageAbsoluteUrl} />
      {/** Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:image:src" content={imageAbsoluteUrl} />
      {/** */}
      <link rel="canonical" href={url} />
      <link
        //name="favicon"
        rel="shortcut icon"
        href={faviconUrl || "/favicon.svg"}
      />
    </>
  );
}
