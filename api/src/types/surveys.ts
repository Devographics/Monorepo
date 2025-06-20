import { RequestContext } from '.'

import {
    Survey,
    Edition,
    Section,
    Question,
    Option,
    ResponseEditionData,
    ResponseArguments,
    FacetBucket,
    Bucket,
    QuestionTemplateOutput,
    SectionMetadata,
    EditionMetadata,
    SurveyMetadata,
    ResultsSubFieldEnum,
    OptionGroup
} from '@devographics/types'

export type TypeObject = {
    typeName: string
    typeDef: string
    typeType?: string
    path?: string
    // surveyId?: string
    // questionId?: string
}

export type TemplateArguments = {
    survey: Survey
    edition: Edition
    section: Section
    question: Question
}

export type ApiTemplateFunction = (arg0: TemplateArguments) => QuestionApiTemplateOutput

export type NullTemplate = (arg0: TemplateArguments) => { includeInApi: boolean }

export interface TemplatesDictionnary {
    [index: string]: ApiTemplateFunction | NullTemplate
}

export interface ResolverMap {
    [key: string]: ResolverType | ResolverMap
}

export interface ResolverParent {
    survey: SurveyApiObject
    edition: EditionApiObject
    section: SectionApiObject
    question: QuestionApiObject
    questionObjects: QuestionApiObject[]
    responseArguments?: ResponseArguments
    args?: any // args passed down to lower levels
}

export type QuestionResolverParent = ResolverParent & {
    [key in ResultsSubFieldEnum]?: ResolverType
}

export type ResolverType = (
    parent: ResolverParent,
    args: any,
    context: RequestContext,
    info: any
) => any

export type TransformFunction = (
    parent: ResolverParent,
    data: ResponseEditionData[],
    context: RequestContext
) => any

// // ParsedQuestion extended with API-specific fields
// export interface SurveyApiObject extends Omit<SurveyApiObject, 'editions'> {
//     editions: EditionApiObjectExt[]
// }

// // ParsedQuestion extended with API-specific fields
// export interface EditionApiObjectExt extends Omit<EditionApiObject, 'sections'> {
//     sections: ParsedSectionExt[]
// }

// // ParsedQuestion extended with API-specific fields
// export interface ParsedSectionExt extends Omit<ParsedSection, 'questions'> {
//     questions: QuestionApiObject[]
// }

export interface QuestionApiTemplateOutput extends QuestionTemplateOutput {
    resolverMap?: ResolverMap
    transformFunction?: TransformFunction

    autogenerateOptionType?: boolean
    autogenerateEnumType?: boolean
    autogenerateFilterType?: boolean

    fieldTypeName?: string
    filterTypeName?: string
    optionTypeName?: string
    enumTypeName?: string

    generatedBy?: string
    typeDef?: string
}

export interface SurveyApiObject extends Omit<Survey, 'editions'> {
    editions: EditionApiObject[]
}

export interface EditionApiObject extends Omit<Edition, 'sections' | 'apiSections'> {
    sections: SectionApiObject[]
    // apiSections: SectionApiObject[]

    // only when this appears as part of a complete survey metadata tree
    surveyId?: string
    survey?: Survey
}

export interface SectionApiObject extends Omit<Section, 'questions'> {
    questions: QuestionApiObject[]

    // a section that's in the API but not the outline
    apiOnly?: boolean
}

export interface QuestionApiObject extends QuestionApiTemplateOutput {
    // a question that's in the outline but not in the API
    includeInApi?: boolean

    editions?: string[]

    isGlobal?: boolean

    contentType?: string

    sectionIds?: string[]
    sectionIndex?: number
    surveyId: string
    survey: SurveyApiObject

    // only when this appears as part of a complete edition metadata tree
    editionId?: string
    section?: Section
    edition?: Edition
    // a question that's in the API but not the outline
    apiOnly?: boolean

    groups?: OptionGroup[]
}

export enum IncludeEnum {
    OUTLINE_ONLY = 'outlineOnly',
    API_ONLY = 'apiOnly',
    ALL = 'all'
}

export {
    Survey,
    Edition,
    Section,
    Question,
    QuestionTemplateOutput,
    Option,
    ResponseEditionData,
    FacetBucket,
    ResponseArguments,
    Bucket
} from '@devographics/types'
