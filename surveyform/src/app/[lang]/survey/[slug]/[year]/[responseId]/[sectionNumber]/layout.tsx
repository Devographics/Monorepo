import { initRedis } from "@devographics/redis";

import { StringsRegistry } from "@devographics/react-i18n";
import { Metadata } from "next";
import { serverConfig } from "~/config/server";
import { SectionProvider } from "~/components/SectionContext/SectionProvider";
import { getSectionKey, getEditionTitle } from "~/lib/surveys/helpers";
import { rscFetchLocaleFromUrl } from "~/i18n/server/rsc-fetchers";
import { rscGetSurveyEditionFromUrl } from "../../rsc-fetchers";

interface SurveySectionParams {
  lang: string;
  slug: string;
  year: string;
  sectionNumber: string;
}

export async function generateMetadata({
  params,
}: {
  params: SurveySectionParams;
}): Promise<Metadata> {
  // TODO: it seems we need to call this initialization code on all relevant pages/layouts
  initRedis(serverConfig().redisUrl);
  const edition = await rscGetSurveyEditionFromUrl(params);
  if (!edition) return {};
  const loc = await rscFetchLocaleFromUrl({ langParam: params.lang });
  if (!loc) {
    return {
      title: getEditionTitle({ edition }),
    };
  }
  const { localeId, localeWithStrings } = loc;
  const { name = "" } = edition.survey;
  const { year } = edition;
  // localized description
  // similar to how we get translated strings client-side
  const stringsRegistry = new StringsRegistry(localeId);
  stringsRegistry.addStrings(localeId, localeWithStrings.strings);
  // TODO: this doesn't fallback to english
  const description = stringsRegistry.getString({
    localeId,
    id: "general.take_survey",
    values: { name, year: year + "" },
  });
  // title
  let title = getEditionTitle({ edition });
  try {
    const section = edition.sections?.[parseInt(params.sectionNumber) - 1];
    const sectionTitle =
      section &&
      stringsRegistry.getString({ localeId, id: getSectionKey(section) });
    title = getEditionTitle({ edition, sectionTitle });
  } catch (err) {
    console.error("cant get section", err, params);
  }
  return {
    title,
    description,
  };
}

export default async function WithSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: SurveySectionParams;
}) {
  return (
    // TODO: useParams should be enough, we don't need data fetching here
    // but it's not yet implemented in Next 13.0.6 (07/12/2022)
    <SectionProvider section={parseInt(params.sectionNumber)}>
      {children}
    </SectionProvider>
  );
}
