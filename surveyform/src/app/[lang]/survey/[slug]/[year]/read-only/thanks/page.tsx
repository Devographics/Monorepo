import Finish from "~/components/pages/Finish";
import { serverConfig } from "~/config/server";
import { initRedis } from "@devographics/redis";
import { rscMustGetSurveyEdition } from "../../rsc-fetchers";
import { rscMustGetUserResponse } from "~/lib/responses/rsc-fetchers";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { routes } from "~/lib/routes";
import { redirect } from "next/navigation";
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
  initRedis(serverConfig().redisUrl);
  const currentUser = await rscCurrentUser();
  if (!currentUser) {
    redirect(
      routes.account.login.from(`/survey/${slug}/${year}/${responseId}/thanks`)
    );
  }
  // get the response from current user since we don't have the responseId in URL
  const response = await rscMustGetUserResponse({ currentUser, slug, year });

  const readOnly = responseId === "read-only";
  // NOTE: Next.js 13 automatically deduplicate request
  // it's ok to fetch data again here after fetching in the layout
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  const edition = await rscMustGetSurveyEdition({ slug, year });
  return <Finish readOnly={true} edition={edition} response={response} />;
};

export default ThanksPage;
