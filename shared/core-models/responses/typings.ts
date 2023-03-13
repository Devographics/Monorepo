import { SurveyEdition } from "@devographics/core-models/surveys/typings";
import { VulcanDocument } from "@vulcanjs/schema";
export interface ResponseDocument extends VulcanDocument {
  name?: string;
  year?: number;
  pagePath?: string;
  /**
   * @deprecated Use surveyEditionId instead
   */
  surveySlug?: SurveyEdition["surveyEditionId"];
  surveyEditionId?: string,
  surveyId?: string,
}

/**
 * @deprecated use new naming "ResponseDocument"
 */
export type ResponseType = ResponseDocument;
