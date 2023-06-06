import { notFound, redirect } from "next/navigation";
import {
  SurveySection,
  SurveySectionReadOnly,
} from "~/components/questions/SurveySection";
import { rscMustGetSurveyEdition } from "../../rsc-fetchers";
import { rscMustGetUserResponse } from "~/lib/responses/rsc-fetchers";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { routes } from "~/lib/routes";
import { SurveyStatusEnum } from "@devographics/types";

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
  const edition = await rscMustGetSurveyEdition({ slug, year });
  const sn = parseInt(sectionNumber);
  if (isNaN(sn)) notFound();

  const currentUser = await rscCurrentUser();
  if (!currentUser) {
    return redirect(routes.account.login.from(`/survey/${slug}/${year}`));
  }
  const response = await rscMustGetUserResponse({ currentUser, slug, year });

  // read-only mode
  if (
    ![SurveyStatusEnum.OPEN, SurveyStatusEnum.PREVIEW].includes(edition.status)
  ) {
    return <SurveySectionReadOnly /*response={response}*/ />;
  }
  // TODO: @see https://github.com/vercel/next.js/issues/49387#issuecomment-1564539515
  return (
    <SurveySection
    /*response={response}*/
    // edition={edition}
    // sectionNumber={sn}
    />
  );
};

export default SurveyFromResponseIdPage;
