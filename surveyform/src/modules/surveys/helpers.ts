import surveys, { SurveyType } from "~/surveys";
import { ResponseType } from "~/modules/responses";

export const getSurveyFromResponse = (response: ResponseType) =>
  surveys.find((s) => s.slug === response.surveySlug);

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
  survey?: SurveyType | null;
  number?: any;
  response?: any;
  home?: boolean;
}) => {
  const survey = surveyArgument || getSurveyFromResponse(response);
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
