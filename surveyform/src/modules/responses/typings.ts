import { VulcanDocument } from "@vulcanjs/schema";
export interface ResponseType extends VulcanDocument {
  name?: string;
  year?: number;
  surveySlug?: string;
}

// To be more consistent with the naming
export type ResponseDocument = ResponseType;
