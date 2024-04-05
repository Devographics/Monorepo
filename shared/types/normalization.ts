export interface NormalizationMetadata {
    raw: string
    tokens: NormalizationToken[]
}

export interface NormalizationToken {
    id: string
    pattern: string
}

export interface CustomNormalizationToken extends NormalizationToken {
    match?: string
}

export interface FullNormalizationToken extends CustomNormalizationToken {
    match: string
    length: number
    rules: number
    range: [number, number]
}
