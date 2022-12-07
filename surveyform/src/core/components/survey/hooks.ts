import { useSearchParams } from "next/navigation";
import { useResponse } from "./ResponseContext/ResponseProvider";
import { useSurvey } from "./SurveyContext/Provider";

export const useSurveyParams = (): { slug: string; year: string } => {
  const survey = useSurvey()
  if (!survey) {
    throw new Error("Called useSurveyParams outside of survey page")
  }
  // TODO: we will need useParams instead, it's not yet released (07/12/2022)
  const slug = survey.slug! // TODO: or prettySlug??
  const year = survey.year + ""
  return { slug, year };
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
  // TODO: we will need useParams instead, it's not yet released (07/12/2022)
  const rootParams = useSurveyParams(); // slug and year
  const query = useSearchParams();
  const { id: responseId } = useResponse()
  const sectionNumber = query.get("sectionNumber");
  return {
    ...rootParams,
    responseId: responseId as string,
    sectionNumber: sectionNumber
      ? parseInt(sectionNumber as string)
      : undefined,
  };
};
