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
  /**
   * js2022
   */
  surveyEditionId?: string,
  /**
   * state_of_js
   */
  surveyContextId?: string,
}

/**
 * @deprecated use new naming "ResponseDocument"
 */
export type ResponseType = ResponseDocument;
