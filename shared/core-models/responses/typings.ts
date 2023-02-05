import { SurveyEdition } from "@devographics/core-models/surveys/typings";
import { VulcanDocument } from "@vulcanjs/schema";
export interface ResponseDocument extends VulcanDocument {
  name?: string;
  year?: number;
  pagePath?: string;
  surveySlug?: SurveyEdition["surveyId"];
}

/**
 * @deprecated use new naming "ResponseDocument"
 */
export type ResponseType = ResponseDocument;
