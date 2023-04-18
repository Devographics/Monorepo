import { RequestContext } from '.'

import {
    Survey,
    Edition,
    Section,
    Question,
    ParsedSurvey,
    ParsedEdition,
    ParsedSection,
    ParsedQuestion,
    TemplateOutputQuestion,
    Option,
    ResponseEditionData,
    ResponseArguments,
    FacetBucket,
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

export type ApiTemplateFunction = (arg0: TemplateArguments) => TemplateOutputQuestion

export type NullTemplate = (arg0: TemplateArguments) => { includeInApi: boolean }

export interface TemplatesDictionnary {
    [index: string]: ApiTemplateFunction | NullTemplate
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

// ParsedQuestion extended with API-specific fields
export interface ParsedSurveyExt extends Omit<ParsedSurvey, 'editions'> {
    editions: ParsedEditionExt[]
}

// ParsedQuestion extended with API-specific fields
export interface ParsedEditionExt extends Omit<ParsedEdition, 'sections'> {
    sections: ParsedSectionExt[]
}

// ParsedQuestion extended with API-specific fields
export interface ParsedSectionExt extends Omit<ParsedSection, 'questions'> {
    questions: ParsedQuestionExt[]
}

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
    TemplateOutputQuestion,
    Option,
    ResponseEditionData,
    FacetBucket,
    ResponseArguments,
    Bucket
} from '@devographics/types'
