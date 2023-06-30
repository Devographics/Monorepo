import {
  EditionMetadata,
  Entity,
  ResponseDocument,
  SurveyMetadata,
} from "@devographics/types";
import { EntityRule } from "./helpers";

export interface UpdateBulkOperation {
  updateMany: any;
}

export interface ReplaceBulkOperation {
  replaceOne: any;
}

export type BulkOperation = UpdateBulkOperation | ReplaceBulkOperation;

export interface NormalizationToken {
  id: string;
  pattern: string;
  match: string;
  length: number;
  rules: number;
  range: [number, number];
}

export enum DocumentGroups {
  NORMALIZED = "normalized",
  UNMATCHED = "unmatched",
  UNNORMALIZABLE = "unnormalizable",
  ERROR = "error",
  EMPTY = "empty",
}

export interface Counts {
  normalized: number;
  prenormalized: number;
  comment: number;
  regular: number;
}

export interface NormalizedDocumentMetadata {
  responseId: string;
  errors?: any[];
  normalizedResponseId?: string;
  normalizedFieldsCount?: number;
  prenormalizedFieldsCount?: number;
  regularFieldsCount?: number;
  normalizedFields?: NormalizedField[];
  group?: DocumentGroups;
  counts?: Counts;
  empty?: boolean;
}

export interface NormalizeInBulkResult {
  editionId?: string;
  normalizedDocuments: NormalizedDocumentMetadata[];
  unmatchedDocuments: NormalizedDocumentMetadata[];
  unnormalizableDocuments: NormalizedDocumentMetadata[];
  errorDocuments: NormalizedDocumentMetadata[];
  emptyDocuments: NormalizedDocumentMetadata[];
  totalDocumentCount: number;
  duration?: number;
  count?: number;
  errorCount: number;
  operationResult?: any;
  discardedCount: number;
  limit?: number;
  isSimulation: boolean;
}

export interface NormalizationResult {
  normalizedResponse: NormalizedResponseDocument;
  normalizedFields: Array<NormalizedField>;
  prenormalizedFields: Array<RegularField>;
  regularFields: Array<RegularField>;
  commentFields: Array<RegularField>;
  errors?: any[];
  modifier?: any;
  discard?: boolean;
}

export interface NormalizationResultExtended extends NormalizationResult {
  response: ResponseDocument;
  responseId: string;
  counts: Counts;
  selector: { responseId: string };
}

export interface NormalizationResultEmpty extends NormalizationResult {
  discard: true;
  empty: true;
}
export interface NormalizationResultError extends NormalizationResult {
  discard: true;
  errors: any[];
}

export type NormalizeResponsesArgs = {
  surveyId?: string;
  editionId?: string;
  questionId?: string;
  responsesIds?: string[];
  startFrom?: number;
  limit?: number;
  onlyUnnormalized?: boolean;
};

export interface RegularField {
  questionId: string;
  fieldPath: string;
  value: any;
}
export interface NormalizedField extends RegularField {
  normTokens: Array<NormalizationToken>;
  raw: string;
}
export interface CommentField extends RegularField {}
export interface PrenormalizedField extends RegularField {}

export interface NormalizationError {
  type: string;
  documentId: string;
}

export interface NormalizationOptions {
  response: ResponseDocument;
  rules?: any;
  log?: Boolean;
  verbose?: boolean;
  isSimulation?: boolean;
  questionId?: string;
  isBulk?: boolean;
  survey?: SurveyMetadata;
  edition?: EditionMetadata;
  entities?: Entity[];
  entityRules?: EntityRule[];
  isRenormalization?: boolean;
}

export interface NormalizationParams extends NormalizationOptions {
  normResp: NormalizedResponseDocument;
  survey: SurveyMetadata;
  edition: EditionMetadata;
  entityRules: EntityRule[];
  privateFields?: any;
  errors?: any;
  discard?: boolean;
  empty?: boolean;
  modifier?: any;
}

export interface NormalizedResponseDocument extends ResponseDocument {
  responseId: ResponseDocument["_id"];
  generatedAt: Date;
  surveyId: SurveyMetadata["id"];
  editionId: EditionMetadata["id"];
}

export interface NormalizeFieldResult {
  normalizedResponse: NormalizedResponseDocument;
  modified: boolean;
  normalizedFields: Array<NormalizedField>;
  prenormalizedFields: Array<RegularField>;
  regularFields: Array<RegularField>;
  commentFields: Array<RegularField>;
}

export type StepFunction = (
  NormalizationParams
) => Promise<NormalizedResponseDocument>;
