import { notFound, redirect } from "next/navigation";
import {
  SurveySection,
  SurveySectionReadOnly,
} from "~/components/questions/SurveySection";
import { rscMustGetSurveyEditionFromUrl } from "../../rsc-fetchers";
import { rscMustGetUserResponse } from "~/lib/responses/rsc-fetchers";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { routes } from "~/lib/routes";
import { SurveyStatusEnum } from "@devographics/types";
import { DebugRSC } from "~/components/debug/DebugRSC";

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
  const { data: edition, ___metadata: ___rscMustGetSurveyEditionFromUrl } =
    await rscMustGetSurveyEditionFromUrl({
      slug,
      year,
    });
  const sn = parseInt(sectionNumber);
  if (isNaN(sn)) notFound();

  const currentUser = await rscCurrentUser();
  if (!currentUser) {
    return redirect(routes.account.login.from(`/survey/${slug}/${year}`));
  }

  // read-only mode
  if (edition.status === SurveyStatusEnum.CLOSED) {
    return <SurveySectionReadOnly />;
  }
  // TODO: @see https://github.com/vercel/next.js/issues/49387#issuecomment-1564539515
  return (
    <>
      <DebugRSC {...{ ___rscMustGetSurveyEditionFromUrl }} />
      <SurveySection />
    </>
  );
};

export default SurveyFromResponseIdPage;
