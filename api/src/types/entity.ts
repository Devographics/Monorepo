import { GitHub } from './github'
import { MDN } from './mdn'

export interface Entity {
    id: string
    aliases?: string[]
    name: string
    otherName: string
    twitterName: string
    homepage?: string
    category?: string
    description?: string
    tags?: string[]
    match?: string[]
    github?: GitHub
    npm?: string
    caniuse?: string
    type?: string
    mdn?: string
    patterns?: string[]
    normalizationOnly?: boolean
}

export interface EntityBucket {
    id: string
    count: number
    percentage_survey: number
    percentage_question: number
    percentage_facet: number
    entity: Entity
}
