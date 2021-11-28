import { YearCompletion } from './index'
import { Entity } from './entity'

export interface ToolExperienceBucket {
    id: string
    count: number
    percentage: number
}

export interface ToolAwarenessUsageInterestSatisfaction {
    awareness: number
    usage: number
    interest: number
    satisfaction: number
}

export interface ToolYearExperience {
    year: number
    total: number
    completion: YearCompletion
    buckets: ToolExperienceBucket[]
    awarenessUsageInterestSatisfaction: ToolAwarenessUsageInterestSatisfaction
}

export interface ToolExperience {
    all_years: ToolYearExperience[]
    year: ToolYearExperience
}

export interface Tool {
    id: string
    experience: ToolExperience
    entity: Entity
}

export interface ToolExperienceRankingYearMetric {
    year: number
    rank: number
    percentage: number
}

export interface ToolExperienceRanking {
    id: string
    entity: Entity
    awareness: ToolExperienceRankingYearMetric[]
    interest: ToolExperienceRankingYearMetric[]
    satisfaction: ToolExperienceRankingYearMetric[]
}

export interface ToolsRankings {
    ids: string[]
    experience: ToolExperienceRanking[]
}
