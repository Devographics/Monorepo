import type { Metadata } from "next";
import { SectionProvider } from "~/components/SectionContext/SectionProvider";
import { rscGetSurveyEditionFromUrl } from "../../rsc-fetchers";
// import { rscGetMetadata } from "~/lib/surveys/rsc-fetchers";

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
}): Promise<Metadata | undefined> {
  return undefined;
  // return await rscGetMetadata({ params });
}

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
