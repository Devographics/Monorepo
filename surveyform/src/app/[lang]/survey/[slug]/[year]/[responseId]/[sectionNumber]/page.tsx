import { ResponseDocument } from "@devographics/core-models";
import { getRawResponsesCollection } from "@devographics/mongo";
import { getGroups } from "@vulcanjs/permissions";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "~/account/user/api/fetchers";
import SurveySection from "~/surveys/components/questions/SurveySection";
import { mustGetSurveyEdition } from "../../fetchers";
import omit from "lodash/omit";
import { responseRestrictedFields } from "~/responses/server/shema";
import { cache } from "react";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";
import { routes } from "~/lib/routes";

// TODO: test the security of this thoroughly
const mustGetUserResponse = cache(
  async ({ editionId }: { editionId: string }) => {
    // TODO: get user response directly here, so we don't need the responseId anymore
    const currentUser = await getCurrentUser();
    if (!currentUser) redirect(routes.account.login.href);
    const Responses = await getRawResponsesCollection<ResponseDocument>();
    const selector = {
      userId: currentUser._id,
      editionId: editionId,
    };
    console.log({ selector });
    const responseFromDb = await Responses.findOne(selector);
    if (!responseFromDb) {
      return notFound();
    }
    if (responseFromDb.userId !== currentUser._id) {
      throw new Error("Response retrieved from server doesn't match");
    }
    // fill currentUser groups
    currentUser.groups = getGroups(currentUser, responseFromDb);
    // remove fields that user cannot read
    const response = omit(responseFromDb, responseRestrictedFields);
    return response;
  }
);

// SectionNumber is optional in the URL so this page is exactly the same as ../index.tsx
const SurveyFromResponseIdPage = async ({
  params: { slug, year, responseId, sectionNumber },
}: {
  params: {
    slug: string;
    year: string;
    responseId: string;
    sectionNumber: string;
  };
}) => {
  initRedis(serverConfig().redisUrl);
  const edition = await mustGetSurveyEdition({ slug, year });
  const sn = parseInt(sectionNumber);
  if (isNaN(sn)) notFound();

  // TODO: uncomment to get the response from RSC, and pass down to SurveySection
  // this just need a bit more testing
  // const response = await mustGetUserResponse({ editionId: edition.id });
  // console.log({ response });

  return (
    <SurveySection
      edition={edition}
      responseId={responseId}
      sectionNumber={sn}
    />
  );
};

export default SurveyFromResponseIdPage;
