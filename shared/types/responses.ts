export interface ResponseDocument {
  _id: string;
  year?: number;
  editionId?: string;
  surveyId?: string;
  [key: string]: any;
}
