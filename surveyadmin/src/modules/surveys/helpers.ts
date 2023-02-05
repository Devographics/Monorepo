import surveys from "~/surveys";
import type { SurveyEdition, ResponseDocument } from "@devographics/core-models";

export const getSurvey = (prettySlug, year) =>
  surveys.find((s) => s.prettySlug === prettySlug && s.year === parseInt(year));

export const getSurveyBySlug = (slug?: string) =>
  surveys.find((s) => s.slug === slug);

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
  const survey = surveyArgument
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
