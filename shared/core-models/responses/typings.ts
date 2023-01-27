import { VulcanDocument } from "@vulcanjs/schema";
export interface ResponseDocument extends VulcanDocument {
  name?: string;
  year?: number;
  surveySlug?: string;
  pagePath?: string;
}

/**
 * @deprecated use new naming "ResponseDocument"
 */
export type ResponseType = ResponseDocument;
