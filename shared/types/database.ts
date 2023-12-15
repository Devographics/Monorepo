export interface CustomNormalizationParams {
  surveyId: string;
  editionId: string;
  questionId: string;
  responseId: string;
  rawPath: string;
  normPath: string;
  rawValue: string;
  answerIndex: number;
  tokens: string[];
}

export interface CustomNormalizationDocument
  extends Omit<CustomNormalizationParams, "tokens"> {
  normalizationId: string;
  customTokens: string[];
  disabledTokens: string[];
}
