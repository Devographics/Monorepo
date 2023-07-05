import { EditionMetadata } from "@devographics/types";
import { LocaleDef } from "~/i18n/typings";
import { reverseSurveyParamsLookup } from "../data";

export function getEditionHomePath({
  edition,
  locale,
}: {
  edition: EditionMetadata;
  locale: LocaleDef;
}) {
  const { surveySlug, editionSlug } = reverseSurveyParamsLookup({
    surveyId: edition.survey.id,
    editionId: edition.id,
  });
  const prefixSegment = "survey";
  return "/" + [locale.id, prefixSegment, surveySlug, editionSlug].join("/");
}
