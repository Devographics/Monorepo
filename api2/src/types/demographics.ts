export interface EditionParticipation {
    editionId: string
    total: number
}

export interface Participation {
    all_editions: EditionParticipation[]
    edition: EditionParticipation
}
