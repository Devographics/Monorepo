import { SectionProvider } from "~/components/SectionContext/SectionProvider";

interface SurveySectionParams {
  lang: string;
  slug: string;
  year: string;
  sectionNumber: string;
}

export default async function WithSectionLayout(
  props: {
    children: React.ReactNode;
    params: Promise<SurveySectionParams>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  return (
    // TODO: useParams should be enough, we don't need data fetching here
    // but it's not yet implemented in Next 13.0.6 (07/12/2022)
    (<SectionProvider section={parseInt(params.sectionNumber)}>
      {children}
    </SectionProvider>)
  );
}
