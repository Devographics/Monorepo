import { notFound } from "next/navigation";
import { SurveySectionWithResponse } from "~/components/questions/SurveySection";
import { initRedis } from "@devographics/redis";
import { serverConfig } from "~/config/server";
import { rscMustGetSurveyEdition } from "../../rsc-fetchers";

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
  const edition = await rscMustGetSurveyEdition({ slug, year });
  const sn = parseInt(sectionNumber);
  if (isNaN(sn)) notFound();

  // TODO: uncomment to get the response from RSC, and pass down to SurveySection
  // this just need a bit more testing
  // const response = await mustGetUserResponse({ editionId: edition.id });
  // console.log({ response });

  return (
    <SurveySectionWithResponse
      edition={edition}
      responseId={responseId}
      sectionNumber={sn}
    />
  );
};

export default SurveyFromResponseIdPage;
