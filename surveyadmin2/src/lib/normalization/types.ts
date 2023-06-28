import {
  EditionMetadata,
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

export interface NormalizedDocumentMetadata {
  responseId: string;
  errors?: any[];
  normalizedResponseId?: string;
  normalizedFieldsCount?: number;
  prenormalizedFieldsCount?: number;
  regularFieldsCount?: number;
  normalizedFields?: NormalizedField[];
}

export interface NormalizeInBulkResult {
  editionId?: string;
  normalizedDocuments: NormalizedDocumentMetadata[];
  duration?: number;
  count?: number;
  errorCount: number;
  operationResult?: any;
  discardedCount?: number;
}

export interface NormalizationResult {
  response: any;
  responseId: string;

  selector: any;
  modifier: any;

  errors: Array<NormalizationError>;
  discard?: boolean;

  normalizedResponseId?: string;
  normalizedResponse?: any;

  normalizedFields?: Array<NormalizedField>;
  prenormalizedFields?: Array<RegularField>;
  regularFields?: Array<RegularField>;

  normalizedFieldsCount?: number;
  prenormalizedFieldsCount?: number;
  regularFieldsCount?: number;
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
  fieldPath: string;
  value: any;
}
export interface NormalizedField extends RegularField {
  normTokens: Array<NormalizationToken>;
  questionId: string;
  raw: string;
}

export interface NormalizationError {
  type: string;
  documentId: string;
}

export interface NormalizationOptions {
  document: any;
  entities?: Array<any>;
  rules?: any;
  log?: Boolean;
  fileName?: string;
  verbose?: boolean;
  isSimulation?: boolean;
  questionId?: string;
  isBulk?: boolean;
  surveys?: SurveyMetadata[];
  isRenormalization?: boolean;
}

export interface NormalizationParams {
  response: any;
  normResp: any;
  prenormalizedFields: RegularField[];
  normalizedFields: NormalizedField[];
  regularFields: RegularField[];
  options: NormalizationOptions;
  fileName?: string;
  survey: SurveyMetadata;
  edition: EditionMetadata;
  allRules: EntityRule[];
  privateFields?: any;
  result?: any;
  errors?: any;
  questionId?: string;
  verbose?: boolean;
  isRenormalization?: boolean;
}

export interface NormalizedResponseDocument extends ResponseDocument {
  responseId: ResponseDocument["_id"];
  generatedAt: Date;
  surveyId: SurveyMetadata["id"];
  editionId: EditionMetadata["id"];
}
