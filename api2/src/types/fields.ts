export type AllFields = Section[]

export type Section = {
    id: string
    template: string
    fields: Field[]
}

export type Field = {
    id: string
    sectionId: string
    path?: string
    templateName: string
    options?: Option[]
    optionsTypeName?: string
    optionsAreNumeric: boolean
    filterTypeName?: string
    fieldTypeName?: string
}

export type Option = {
    id: string
    average?: number
    editions?: string[]
}
