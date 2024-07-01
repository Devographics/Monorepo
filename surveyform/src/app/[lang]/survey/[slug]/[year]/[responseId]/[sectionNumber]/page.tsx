import { notFound, redirect } from "next/navigation";
import {
  SurveySection,
  SurveySectionReadOnly,
} from "~/components/questions/SurveySection";
import { rscMustGetSurveyEditionFromUrl } from "../../rsc-fetchers";
import { rscCurrentUser } from "~/account/user/rsc-fetchers/rscCurrentUser";
import { routes } from "~/lib/routes";
import { SurveyStatusEnum } from "@devographics/types";
import { DebugRSC } from "~/components/debug/DebugRSC";
import { setLocaleIdServerContext } from "~/i18n/rsc-context";
import { rscLocaleFromParams } from "~/lib/api/rsc-fetchers";
import { filterClientSideStrings } from "@devographics/i18n/server";
import { tokens as tokensSurveySection } from "~/components/questions/SurveySection.tokens";
import { I18nContextProvider } from "@devographics/react-i18n";
import { getCommonContexts, getEditionContexts } from "~/i18n/config";
import { Context } from "@sentry/node/types/integrations";

const clientTokens = [...tokensSurveySection];

// SectionNumber is optional in the URL so this page is exactly the same as ../index.tsx
const SurveyFromResponseIdPage = async ({
  params: { slug, year, responseId, sectionNumber, lang },
}: {
  params: {
    lang: string;
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

  setLocaleIdServerContext(lang); // Needed for "ServerT"
  const contexts = [...getCommonContexts(), ...getEditionContexts({ edition })];
  const { locale, localeId, error } = await rscLocaleFromParams({
    lang,
    contexts,
  });
  if (error) return <div>Can't load translations</div>;
  // TODO: get correct tokens
  const clientSideLocale = filterClientSideStrings<{}>(
    locale,
    clientTokens,
    {},
    { pageName: "survey_slug_year_responseId_sectionNumber" },
  );
  const currentUser = await rscCurrentUser();
  if (!currentUser) {
    return redirect(routes.account.login.from(`/survey/${slug}/${year}`));
  }

  // TODO: @see https://github.com/vercel/next.js/issues/49387#issuecomment-1564539515
  return (
    <I18nContextProvider locale={clientSideLocale}>
      <DebugRSC {...{ ___rscMustGetSurveyEditionFromUrl }} />
      {edition.status === SurveyStatusEnum.CLOSED ? (
        <SurveySectionReadOnly />
      ) : (
        <SurveySection />
      )}
    </I18nContextProvider>
  );
};

export default SurveyFromResponseIdPage;
