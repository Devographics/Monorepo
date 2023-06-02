import { SectionProvider } from "~/components/SectionContext/SectionProvider";

interface SurveySectionParams {
  lang: string;
  slug: string;
  year: string;
  sectionNumber: string;
}

// revalidate only every 12h
export const revalidate = 60 * 60 * 12;

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
