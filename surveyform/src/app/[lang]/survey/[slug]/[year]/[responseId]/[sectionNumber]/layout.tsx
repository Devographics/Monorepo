import { Metadata } from "next";
import { SectionProvider } from "~/components/SectionContext/SectionProvider";
import { getSectionKey, getEditionTitle } from "~/lib/surveys/helpers";
import { rscGetSurveyEditionFromUrl } from "../../rsc-fetchers";
import { rscIntlContext } from "~/i18n/rsc-fetchers";

interface SurveySectionParams {
  lang: string;
  slug: string;
  year: string;
  sectionNumber: string;
}

/*
export async function generateMetadata({
  params,
}: {
  params: SurveySectionParams;
}): Promise<Metadata> {
  const edition = await rscGetSurveyEditionFromUrl(params);
  if (!edition) return {};
  const intlContext = await rscIntlContext({ localeId: params.lang });
  const { name = "" } = edition.survey;
  const { year } = edition;
  const description = intlContext.formatMessage({
    id: "general.take_survey",
    values: { name, year: year + "" },
  });
  // title
  let title = getEditionTitle({ edition });
  try {
    const section = edition.sections?.[parseInt(params.sectionNumber) - 1];
    const sectionTitle =
      section && intlContext.formatMessage({ id: getSectionKey(section) });
    title = getEditionTitle({ edition, sectionTitle });
  } catch (err) {
    console.error("cant get section", err, params);
  }
  return {
    title,
    description,
  };
}
*/

export default async function WithSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: SurveySectionParams;
}) {
  const edition = await rscGetSurveyEditionFromUrl(params);

  if (!edition) {
    throw new Error(
      `Could not find edition for params: ${JSON.stringify(params)}`
    );
  }

  return (
    // TODO: useParams should be enough, we don't need data fetching here
    // but it's not yet implemented in Next 13.0.6 (07/12/2022)
    <SectionProvider section={parseInt(params.sectionNumber)}>
      {children}
    </SectionProvider>
  );
}
