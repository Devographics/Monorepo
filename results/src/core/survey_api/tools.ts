import { Entity } from 'core/types'

export interface ToolExperienceBucket {
    id: string
    count: number
    percentage: number
}

export interface ToolsExperienceToolData {
    id: string
    entity: Entity
    experience: {
        year: {
            total: number
            buckets: ToolExperienceBucket[]
        }
    }
}

export interface ToolExperienceFacet {
    type: string
    id: string
    buckets: ToolExperienceBucket[]
}

export interface ToolYearExperience {
    year: number
    total: number
    facets: ToolExperienceFacet[]
}

export interface ToolAllYearsExperience {
    id: string
    entity: Entity
    experience: {
        all_years: ToolYearExperience[]
    }
}

// For `tools_cardinality_by_user`
export interface ToolsCardinalityByUserBucket {
    cardinality: number
    count: number
    percentage_survey: number
}