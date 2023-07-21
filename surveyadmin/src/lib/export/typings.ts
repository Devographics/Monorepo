export interface ExportOptions {
    editionId: string,
    surveyId: string,
    format: {
        json?: boolean,
        csv?: boolean,
    }
}