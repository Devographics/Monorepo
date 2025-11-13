import { WordCount } from 'data'
import { Entity, Token } from 'entities'

export interface NormalizationMetadata {
    raw: string
    tokens: NormalizationToken[]
}

export interface NormalizationToken {
    id: string
    pattern?: string
}

export type TokenWithCount = Token & { count: number }

export interface CustomNormalizationToken extends NormalizationToken {
    match?: string
}

export interface FullNormalizationToken extends CustomNormalizationToken {
    match: string
    length: number
    rules: number
    range: [number, number]
}

export interface RawDataItem {
    answers: RawDataAnswer[]
    stats: WordCount[]
    entities: Entity[]
    tokens: TokenWithCount[]
}

export interface RawDataAnswer {
    responseId: string
    raw: string
    rawHtml: string
    rawClean: string
    tokens: NormalizationToken[]
}
