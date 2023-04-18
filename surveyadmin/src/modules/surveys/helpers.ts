import type {
  SurveyEdition,
  ResponseDocument,
} from "@devographics/core-models";
import { SurveyMetadata } from "@devographics/types";

export const getSurveyEditionById = (
  allSurveys: SurveyMetadata[],
  editionId: string
) => {
  for (const survey of allSurveys) {
    for (const edition of survey.editions) {
      if (edition.id === editionId) {
        return edition;
      }
    }
  }
};

export const getSurveyPath = ({
  survey: surveyArgument,
  number,
  response,
  home = false,
}: {
  survey?: SurveyEdition | null;
  number?: any;
  response?: any;
  home?: boolean;
}) => {
  const survey = surveyArgument;
  if (!survey) {
    return "";
  }
  const { year, prettySlug } = survey;
  const prefixSegment = "/survey";
  const slugSegment = `/${prettySlug}/${year}`;
  const responseSegment = home
    ? ""
    : (response && `/${response._id}`) || "/read-only";
  const numberSegment = number ? `/${number}` : "";
  const path = [
    prefixSegment,
    slugSegment,
    responseSegment,
    numberSegment,
  ].join("");
  return path;
};
