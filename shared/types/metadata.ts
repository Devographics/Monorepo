/*

Metadata (*not* survey respondents numerical data) provided by the API
about a survey edition and its contents

*/

import { Entity } from './entities'
import { Survey, Edition, Section, Question, Option } from './outlines'

export interface SurveyMetadata extends Omit<Survey, 'editions'> {
    editions: EditionMetadata[]
}

export interface EditionMetadata extends Omit<Edition, 'sections'> {
    sections: SectionMetadata[]
}

export interface SectionMetadata extends Omit<Section, 'questions'> {
    questions: QuestionMetadata[]
}

export interface QuestionMetadata extends Omit<Question, 'options' | 'id'> {
    id: string
    entity?: Entity
    options?: OptionMetadata[]
}

export interface OptionMetadata extends Option {
    entity?: Entity
    label?: string
}
