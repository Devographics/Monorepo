import type { Document } from "mongodb";
import type { SurveyMetadata, EditionMetadata } from "./metadata";

export interface ResponseDocument extends Omit<Document, "_id"> {
  _id: string;
  year?: number;
  editionId: string;
  surveyId: string;
  userId: string;
  updatedAt: Date;
  createdAt: Date;
  completion: number;
  customNormalizations?: CustomNormalizationDefinition[];
  /** Commit SHA during response creation */
  deploymentCommit?: string;
  finishedAt?: any;
  readingList?: any;
  duration?: any;
  knowledgeScore?: number;
  isFinished?: boolean;
  lastSavedAt?: any;
  [key: string]: any;
}

export interface NormalizedResponseDocument extends ResponseDocument {
  responseId: ResponseDocument["_id"];
  generatedAt: Date;
  surveyId: SurveyMetadata["id"];
  editionId: EditionMetadata["id"];
}

/**
 * Fields that are common to all surveys = Response without the specific questions of a survey
 * and thus the generic [key: string] or "Document" fields
 */
export interface GenericResponseDocument extends BrowserData {
  _id: string;
  year?: number;
  editionId: string;
  surveyId: string;
  userId: string;
  updatedAt: Date;
  createdAt: Date;
  createdAtDate: Date;
  completion: number;
  customNormalizations?: CustomNormalizationDefinition[];
  /** Commit SHA during response creation */
  deploymentCommit?: string;
  finishedAt?: any;
  readingList?: any;
  duration?: any;
  knowledgeScore?: number;
  isFinished?: boolean;
  lastSavedAt?: any;
}

export type CustomNormalizationDefinition = {
  rawPath: string;
  rawValue: string;
  tokens: string[];
};

export interface BrowserData {
  common__user_info__source?: string;
  common__user_info__referrer?: string;
  common__user_info__device?: string;
  common__user_info__browser?: string;
  common__user_info__version?: string;
  common__user_info__os?: string;
}

export type OtherParticipationData = {
  surveys: string[];
  editions: string[];
  same_survey_count: number;
};
