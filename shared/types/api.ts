import { Survey, Edition, Section, Question } from './outlines'

export interface ParsedSurvey extends Omit<Survey, 'editions'> {
    editions: ParsedEdition[]
}

export interface ParsedEdition extends Omit<Edition, 'sections' | 'apiSections'> {
    sections: ParsedSection[]
    apiSections: ParsedSection[]
}

export interface ParsedSection extends Omit<Section, 'questions'> {
    questions: ParsedQuestion[]
}

export interface ParsedQuestion extends Omit<Question, 'id'> {
    id: string

    sectionIds: string[]
    sectionIndex: number
    dbPath?: string
    dbPathComments?: string
    includeInApi?: boolean

    editions?: string[]

    surveyId: string

    typeDef?: string

    isGlobal?: boolean

    fieldTypeName: string
    filterTypeName?: string
    optionTypeName?: string
    enumTypeName?: string
}

export interface QuestionTemplateOutput extends Omit<Question, 'id'> {
    id: string
}
