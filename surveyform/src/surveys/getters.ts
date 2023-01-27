import surveys from "~/surveys";
import type {
  ResponseDocument,
} from "@devographics/core-models";

export const getSurveyFromResponse = (response: ResponseDocument) =>
  surveys.find((s) => s.slug === response.surveySlug);

export const getSurvey = (prettySlug, year) =>
  surveys.find((s) => s.prettySlug === prettySlug && s.year === parseInt(year));

export const getSurveyBySlug = (slug?: string) =>
  surveys.find((s) => s.slug === slug);
