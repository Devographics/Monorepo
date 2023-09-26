import { notFound } from "next/navigation";
import { DEFAULT_REVALIDATE_S } from "~/app/revalidation";
import { SurveySectionOutline } from "~/components/questions/SurveySectionOutline";
import { rscGetEditionsMetadata } from "../../rsc-fetchers";

// revalidating is important so we get fresh values from the cache every now and then without having to redeploy
export const revalidate = DEFAULT_REVALIDATE_S;
export const dynamicParams = true;
/**
 * NOTE: ideally we would load surveys in the layout directly
 * but this is not possible to mix static and dynamic pages in the same parent layout (yet)
 * @see https://github.com/vercel/next.js/issues/44712
 */
export async function generateStaticParams() {
  const editions = await rscGetEditionsMetadata({ removeHidden: true });
  const sections = editions.map((e) => ({
    sectionNumber: "1",
    year: String(e.year),
    slug: e.surveyId.replaceAll("_", "-"),
    // Parent params are needed too, atm we only statically render english
    lang: "en-US",
  })); /*
  TODO: editionMetadata do not contain details about the sections
  so this code doesn't work
  but we can at least prerender the first section

  editions
    .map((e) =>
      e.sections
        // TODO: why some sections at the end of the array have no questions?
        .filter((s) => {
          return !!s.questions;
        })
        .map((s, idx) => ({
          sectionNumber: String(idx + 1),
          year: String(e.year),
          slug: e.surveyId.replaceAll("_", "-"),
          // Parent params are needed too, atm we only statically render english
          lang: "en-US",
        }))
    )
    .flat();*/
  return sections;
}

// SectionNumber is optional in the URL so this page is exactly the same as ../index.tsx
export default async function SurveySectionOutlinePage({
  params: { sectionNumber },
}: {
  params: {
    slug: string;
    year: string;
    sectionNumber: string;
  };
}) {
  const sn = parseInt(sectionNumber);
  if (isNaN(sn)) notFound();
  return <SurveySectionOutline />;
}
