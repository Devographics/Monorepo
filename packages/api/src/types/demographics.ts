export interface YearParticipation {
    year: number
    participants: number
}

export interface Participation {
    all_years: YearParticipation[]
    year: YearParticipation
}
