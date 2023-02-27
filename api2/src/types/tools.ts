import { YearCompletion } from './index'
import { Entity } from '@devographics/core-models'

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

export interface ToolEditionExperience {
    year: number
    editionId: string
    total: number
    completion: YearCompletion
    buckets: ToolExperienceBucket[]
    awarenessUsageInterestSatisfaction: ToolAwarenessUsageInterestSatisfaction
}

export interface ToolExperience {
    all_editions: ToolEditionExperience[]
    edition: ToolEditionExperience
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
