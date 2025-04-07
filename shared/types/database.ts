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
  isSuggestion?: boolean;
  isAI?: boolean;
}

export interface CustomNormalizationDocument
  extends Omit<CustomNormalizationParams, "tokens"> {
  _id: string;
  normalizationId: string;
  customTokens?: string[];
  suggestedTokens?: string[];
  aiTokens?: string[];
  disabledTokens: string[];
}
