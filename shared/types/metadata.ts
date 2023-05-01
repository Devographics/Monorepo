/*

Metadata (*not* survey respondents numerical data) provided by the API
about a survey edition and its contents

*/

import { Entity } from './entities'
import { Survey, Edition, Section, Question, Option } from './outlines'
import { DbPaths } from './api'

export interface SurveyMetadata extends Omit<Survey, 'editions'> {
    editions: EditionMetadata[]
}

export interface EditionMetadata extends Omit<Edition, 'sections'> {
    sections: SectionMetadata[]
    surveyId: string
    survey: SurveyMetadata
}

export interface SectionMetadata extends Omit<Section, 'questions'> {
    questions: QuestionMetadata[]
}

export interface QuestionMetadata extends Omit<Question, 'options' | 'id'> {
    id: string
    sectionId?: string
    label?: string
    entity?: Entity
    rawPaths: DbPaths
    normPaths: DbPaths
    options?: OptionMetadata[]
}

export interface OptionMetadata extends Option {
    entity?: Entity
    label?: string
}

export enum ResponsesTypes {
    PREDEFINED = 'Predefined',
    PRENORMALIZED = 'Prenormalized',
    FREEFORM = 'Freeform'
}

export interface MetadataPackage {
    survey: SurveyMetadata
    edition: EditionMetadata
}
