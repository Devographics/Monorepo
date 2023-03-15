import { RequestContext } from '.'

import {
    Survey,
    Edition,
    Section,
    Question,
    QuestionTemplateOutput,
    ParsedSurvey,
    ParsedEdition,
    ParsedSection,
    ParsedQuestion,
    Option,
    EditionData,
    Bucket
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

export type TemplateFunction = (arg0: TemplateArguments) => QuestionTemplateOutput
export type NullTemplate = (arg0: TemplateArguments) => { includeInApi: boolean }

export interface TemplatesDictionnary {
    [index: string]: TemplateFunction | NullTemplate
}

export interface ResolverMap {
    [key: string]: ResolverType | ResolverMap
}

export interface ResolverParent {
    survey: ParsedSurvey
    edition: ParsedEdition
    section: ParsedSection
    question: ParsedQuestionExt
    questionObjects: ParsedQuestionExt[]
    responseArguments?: ResponseArguments
}

export interface QuestionResolverParent extends ResolverParent {
    options?: Option[]
}

export type ResponseArguments = {
    filters: any
    facet: string
    parameters: any
}

export type ResolverType = (
    parent: ResolverParent,
    args: any,
    context: RequestContext,
    info: any
) => any

export type TransformFunction = (
    parent: ResolverParent,
    data: EditionData[],
    context: RequestContext
) => any

// ParsedQuestion extended with API-specific fields
export interface ParsedQuestionExt extends ParsedQuestion {
    resolverMap?: ResolverMap
    transformFunction?: TransformFunction
}

export {
    Survey,
    Edition,
    Section,
    Question,
    QuestionTemplateOutput,
    ParsedSurvey,
    ParsedEdition,
    ParsedSection,
    ParsedQuestion,
    Option,
    EditionData,
    Bucket
} from '@devographics/types'
