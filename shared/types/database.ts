export interface CustomNormalizationDocument {
    surveyId: string
    editionId: string
    questionId: string
    responseId: string
    rawPath: string
    normPath: string
    rawValue: string
    customTokens: string[]
    disabledTokens: string[]
}
