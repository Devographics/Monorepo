import { SurveyDocument } from "@devographics/core-models";

export type SurveyDescription = Pick<SurveyDocument, "name" | "status" | "prettySlug" | "slug" | "year" | "imageUrl">
