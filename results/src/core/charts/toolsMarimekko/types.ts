import { Entity } from '@devographics/types'

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

export interface ToolsExperienceMarimekkoToolData {
    id: string
    entity: Entity
    awareness: number
    // would_not_use: number
    // not_interested: number
    // interested: number
    // would_use: number
    would_not_use_percentage: number
    not_interested_percentage: number
    interested_percentage: number
    would_use_percentage: number
}
