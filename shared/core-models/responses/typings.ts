import { SurveyEdition } from "@devographics/core-models/surveys/typings";
import { VulcanDocument } from "@vulcanjs/schema";
export interface ResponseDocument extends VulcanDocument {
  name?: string;
  year?: number;
  pagePath?: string;
  /**
   * @deprecated Use editionId instead
   */
  surveySlug?: SurveyEdition["editionId"];
  /**
   * js2022
   */
  editionId: string,
  /**
   * state_of_js
   */
  surveyId: string,
}

/**
 * @deprecated use new naming "ResponseDocument"
 */
export type ResponseType = ResponseDocument;
