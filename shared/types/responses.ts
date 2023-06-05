export interface ResponseDocument {
  _id: string;
  year?: number;
  editionId: string;
  surveyId: string;
  userId: string;
  updatedAt: Date;
  createdAt: Date;
  completion: number;
  [key: string]: any;
}
