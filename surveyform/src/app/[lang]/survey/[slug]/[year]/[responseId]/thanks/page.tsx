import Thanks from "~/components/pages/Thanks";
import { serverConfig } from "~/config/server";
import { initRedis } from "@devographics/redis";

import { mustGetSurveyEdition } from "../../fetchers";
// import { getResponseWithRanking } from "./getResponseWithRanking";

const ThanksPage = async ({
  params: { responseId, slug, year },
}: {
  params: {
    responseId: string;
    slug: string;
    year: string;
  };
}) => {
  const readOnly = responseId === "read-only";
  // NOTE: Next.js 13 automatically deduplicate request
  // it's ok to fetch data again here after fetching in the layout
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  initRedis(serverConfig().redisUrl);
  const survey = await mustGetSurveyEdition({ slug, year });
  if (readOnly) {
    return <Thanks readOnly={readOnly} />;
  }
  // TODO: getResponseWithRanking will include the schema that can contain functions
  // thus it's not accepted
  // Uncomment to investigate
  // const response = await getResponseWithRanking({ responseId, survey });
  return <Thanks /*response={response}*/ />;
};

export default ThanksPage;
