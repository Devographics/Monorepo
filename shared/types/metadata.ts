/*

Metadata (*not* survey respondents numerical data) provided by the API
about a survey edition and its contents

*/

import { Entity } from './entities'
import { Survey, Edition, Section, Option, QuestionTemplateOutput } from './outlines'

export interface SurveyMetadata extends Omit<Survey, 'editions'> {
    editions: EditionMetadata[]
}

export interface EditionMetadata extends Omit<Edition, 'sections'> {
    sections: SectionMetadata[]
    /** js2019 */
    surveyId: string
    survey: SurveyMetadata
}

export interface SectionMetadata extends Omit<Section, 'questions'> {
    questions: QuestionMetadata[]
}

export interface QuestionMetadata extends Omit<QuestionTemplateOutput, 'options'> {
    sectionId?: string
    label?: string
    entity?: Entity
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
