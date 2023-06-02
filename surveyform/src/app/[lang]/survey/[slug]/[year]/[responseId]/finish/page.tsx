import Finish from "~/components/pages/Finish";
import { serverConfig } from "~/config/server";
import { initRedis } from "@devographics/redis";
import { rscMustGetSurveyEdition } from "../../rsc-fetchers";
import { rscMustGetResponse } from "~/lib/responses/rsc-fetchers";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { routes } from "~/lib/routes";
import { redirect } from "next/navigation";
import { SurveyStatusEnum } from "@devographics/types";
// TODO: getResponseWithRanking will include the schema that can contain functions
// thus it's not accepted
// Uncomment to investigate
// import { getResponseWithRanking } from "./getResponseWithRanking";

const FinishPage = async ({
  params: { responseId, slug, year, lang },
}: {
  params: {
    lang: string;
    responseId: string;
    slug: string;
    year: string;
  };
}) => {
  initRedis(serverConfig().redisUrl);
  const currentUser = await rscCurrentUser();
  if (!currentUser) {
    redirect(
      routes.account.login.from(`/survey/${slug}/${year}/${responseId}/thanks`)
    );
  }
  const response = await rscMustGetResponse({ responseId, currentUser });
  const edition = await rscMustGetSurveyEdition({ slug, year });
  return <Finish response={response} edition={edition} />;
};

export default FinishPage;