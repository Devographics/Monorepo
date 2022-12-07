import { SectionProvider } from "~/core/components/survey/SectionContext/SectionProvider";

// TODO: this should not be needed in the first place,
// we want this page to be dynamic
export async function generateStaticParams() {
  return [];
}
export default async function WithSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { sectionNumber: string };
}) {
  // TODO: we could fetch the response here and pass it as context
  // instead of doing client-side data fetching
  return (
    // TODO: useParams should be enough, we don't need data fetching here
    // but it's not yet implemented in Next 13.0.6 (07/12/2022)
    <SectionProvider section={parseInt(params.sectionNumber)}>
      {children}
    </SectionProvider>
  );
}
