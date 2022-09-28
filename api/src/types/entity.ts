import { GitHub } from './github'
import { MDN } from './mdn'
import { Entity } from "@devographics/core-models";

export interface EntityBucket {
    id: string
    count: number
    percentage_survey: number
    percentage_question: number
    percentage_facet: number
    entity: Entity
}
