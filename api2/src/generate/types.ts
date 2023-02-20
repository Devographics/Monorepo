export type TypeObject = {
    typeName: string
    typeDef: string
    path: string
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
    template?: string
}

export type Question = {
    id: string
    options?: Option[]
    optionsAreNumeric?: boolean
    template?: string
}

export interface QuestionObject extends Question {
    sectionIds?: string[]
    dbPath: string
    includeInApi?: boolean

    editions?: string[]

    surveyId: string

    isGlobal?: boolean
    fieldTypeName: string
    filterTypeName: string
    optionTypeName: string
    enumTypeName: string
}

export type Option = {
    id: string
    editions: string[]
    average: number
}

export type ResolverType = (root?: any, args?: any, context?: any, info?: any) => any
