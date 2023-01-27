import { SurveyDocument } from "@devographics/core-models";

export type SurveyDescription = Pick<SurveyDocument, "surveyId" | "name" | "status" | "prettySlug" | "slug" | "year" | "imageUrl">
