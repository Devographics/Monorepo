export interface SurveyConfig {
    id: string
    name: string
    domain: string
}

export interface Survey extends SurveyConfig {
    editions: Edition[]
}

export type Edition = {
    id: string
    sections: Section[]
    apiSections: Section[]
    year: number
    credits: Credit[]
}

export type Credit = {
    id: string
}

export type Section = {
    id: string
    slug: string // TODO: maybe get rid of this?
    questions: Question[]
    template?: string
}

export type ApiSection = {
    id: string
    questions: ApiQuestion[]
}

export type ApiQuestion = {
    id: string
    template?: string
}

export type Question = {
    template: string

    id?: string
    options?: Option[]
    optionsAreNumeric?: boolean
    defaultSort?: string

    autogenerateOptionType?: boolean
    autogenerateEnumType?: boolean
    autogenerateFilterType?: boolean
}

export type Option = {
    id: string
    editions?: string[]
    average?: number
    label?: string
}
