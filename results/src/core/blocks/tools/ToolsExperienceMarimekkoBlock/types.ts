import { Entity } from '../../../types'

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
    tool: Entity
    awareness: number
    would_not_use: number
    not_interested: number
    interested: number
    would_use: number
}
