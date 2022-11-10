import surveys from "~/surveys";
import type {
  SurveyDocument,
  ResponseDocument,
} from "@devographics/core-models";

export const getSurveyFromResponse = (response: ResponseDocument) =>
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
  page,
}: {
  survey?: SurveyDocument | null;
  number?: any;
  response?: any;
  home?: boolean;
  page?: "thanks";
}) => {
  const survey = surveyArgument || getSurveyFromResponse(response);
  if (!survey) {
    return "";
  }
  const { year, prettySlug } = survey;
  const prefixSegment = "survey";
  const slugSegment = prettySlug;
  const yearSegment = year;
  const pathSegments = ['/', prefixSegment, slugSegment, yearSegment];

  if (!home) {
    const responseSegment = (response && `${response._id}`) || "read-only";
    pathSegments.push(responseSegment);

    if (page || number) {
      const suffixSegment = page || number;
      pathSegments.push(suffixSegment);
    }
  }
  const path = pathSegments.join("/");
  return path;
};
