import type { ResponseDocument, SurveyMetadata } from "@devographics/types";
import { EditionMetadata } from "@devographics/types";
import { reverseSurveyParamsLookup } from "../data";
import { outlineSegment } from "../../routes";
import { type Locale } from "@devographics/i18n";

export function getEditionSectionPath({
  survey,
  edition,
  locale,
  readOnly,
  response,
  page,
  number,
}: {
  // we only need basic info about the survey
  edition: Pick<EditionMetadata, "id">;
  survey: Pick<SurveyMetadata, "id">;
  /** [state-of-js, 2022] */
  locale: Locale;
  /** No response is needed in read only mode */
  readOnly?: boolean;
  // section
  // TODO: why sometimes we have "id" vs "_id"? (_id coming from Mongo, id from Vulcan probably)
  response?: Partial<Pick<ResponseDocument, "_id">>;
  number?: any;
  page?: "finish";
}) {
  const { surveySlug, editionSlug } = reverseSurveyParamsLookup({
    surveyId: survey.id,
    editionId: edition.id,
  });
  const pathSegments = [locale.id, "survey", surveySlug, editionSlug];

  // point to a page that will only show the questions, with no response
  const showOutline = !response && readOnly
  if (showOutline) {
    pathSegments.push(outlineSegment);
  } else {
    const responseSegment = response?._id;
    if (!responseSegment) {
      console.log(response);
      throw new Error(
        "Response object has no id or _id. We may have failed to load your response from server."
      );
    }
    pathSegments.push(responseSegment);
  }
  const suffixSegment = page || number || 1;
  pathSegments.push(suffixSegment);
  const path = pathSegments.join("/");
  return `/${path}`;
}
