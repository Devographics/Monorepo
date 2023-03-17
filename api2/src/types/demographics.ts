export interface EditionParticipation {
    editionId: string
    total: number
}

export interface Participation {
    allEditions: EditionParticipation[]
    edition: EditionParticipation
}
