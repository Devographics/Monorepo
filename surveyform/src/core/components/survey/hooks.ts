// import { useRouter } from "next/router.js";
import { useSearchParams } from "next/navigation";
import { useMounted } from "~/core/hooks/useMounted";

export const useSurveyParams = (fromProps?: {
  slug?: string;
  year?: string;
}): { slug: string; year: string } => {
  const query = useSearchParams();
  const slug = fromProps?.slug || query.get("slug");
  const year = fromProps?.year || query.get("year");
  return { slug: slug as string, year: year as string };
};

/**
 * The "read-only" param will display the form in read-only mode
 *
 * TODO: typings are not great yet, to be improved
 */
export const useSurveyResponseParams = (): {
  slug: string;
  year: string;
  responseId: string;
  sectionNumber?: number;
} => {
  const rootParams = useSurveyParams(); // slug and year
  const query = useSearchParams();
  const responseId = query.get("responseId");
  const sectionNumber = query.get("sectionNumber");
  return {
    ...rootParams,
    responseId: responseId as string,
    sectionNumber: sectionNumber
      ? parseInt(sectionNumber as string)
      : undefined,
  };
};
