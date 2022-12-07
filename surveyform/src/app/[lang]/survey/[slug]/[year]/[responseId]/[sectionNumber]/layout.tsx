import { SectionProvider } from "~/core/components/survey/SectionContext/SectionProvider";

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
    // TODO: fetch the response here directly
    <SectionProvider section={parseInt(params.sectionNumber)}>
      {children}
    </SectionProvider>
  );
}
