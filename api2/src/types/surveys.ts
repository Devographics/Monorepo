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
    EditionMetadata
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
}

export interface QuestionResolverParent extends ResolverParent {
    options?: Option[]
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

    typeDef?: string
}

export interface SurveyApiObject extends Omit<Survey, 'editions'> {
    editions: EditionApiObject[]
}

export interface EditionApiObject extends Omit<Edition, 'sections' | 'apiSections'> {
    sections: SectionApiObject[]
    apiSections: SectionApiObject[]
}

export interface SectionApiObject extends Omit<Section, 'questions'> {
    questions: QuestionApiObject[]
}

export interface QuestionApiObject extends QuestionApiTemplateOutput {
    includeInApi?: boolean

    editions?: string[]

    isGlobal?: boolean

    contentType?: string

    sectionIds?: string[]
    sectionIndex?: number
    surveyId?: string

    // only when this appears as part of a complete edition outline
    editionId?: string
    section?: SectionMetadata
    edition?: EditionMetadata
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
