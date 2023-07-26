export enum TypeTypeEnum {
    ENUM = 'enum',
    FIELD_GENERATED = 'field_generated',
    FILTER = 'filter',
    OPTION = 'option',
    SECTION = 'section'
}

export interface TypeDefTemplateOutput {
    generatedBy: string
    path?: string
    typeName: string
    typeDef: string
    typeType?: TypeTypeEnum
    surveyId?: string
    questionId?: string
}
