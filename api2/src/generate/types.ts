export type TypeObject = {
    typeName: string
    typeDef: string
}

export type TemplateArguments = {
    survey: Survey
    edition: Edition
    section: Section
    question: Question
}

export type Survey = {
    id: string
    editions: Edition[]
}

export type Edition = {
    id: string
    sections: Section[]
}

export type Section = {
    id: string
    questions: Question[]
}

export type Question = {
    id: string
    sectionId?: string
    path?: string
    template?: string
    options?: Option[]
    optionsAreNumeric?: boolean
    includeInApi?: boolean

    surveyId: string

    fieldTypeName: string
    filterTypeName: string
    optionTypeName: string
    enumTypeName: string
}

export interface QuestionObject extends Question {
    foo?: string
}

export type Option = {
    id: string
    editions: string[]
    average: number
}
