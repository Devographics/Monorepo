import type { Document } from "mongodb";

export interface ResponseDocument extends Omit<Document, "_id"> {
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
