export interface EditionParticipation {
    editionId: string
    total: number
}

export interface Participation {
    allEditions: EditionParticipation[]
    edition: EditionParticipation
}

export interface Country {
    name: string
    'alpha-3': string
    'country-code': number
}
