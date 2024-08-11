import { EditionMetadata } from "@devographics/types";
import { reverseSurveyParamsLookup } from "../data";
import { type Locale } from "@devographics/i18n";

export function getEditionHomePath({
  edition,
  locale,
}: {
  edition: EditionMetadata;
  locale: Locale;
}) {
  const { surveySlug, editionSlug } = reverseSurveyParamsLookup({
    surveyId: edition.survey.id,
    editionId: edition.id,
  });
  const prefixSegment = "survey";
  return "/" + [locale.id, prefixSegment, surveySlug, editionSlug].join("/");
}
