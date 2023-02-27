export interface EditionParticipation {
    editionId: string
    participants: number
}

export interface Participation {
    all_editions: EditionParticipation[]
    edition: EditionParticipation
}
