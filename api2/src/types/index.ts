import { Db } from 'mongodb'
import { Entity } from '@devographics/core-models'

export type Template = any

export type Facet =
    | 'default'
    | 'gender'
    | 'race_ethnicity'
    | 'yearly_salary'
    | 'industry_sector'
    | 'disability_status'
    | 'company_size'
    | 'years_of_experience'
    | 'higher_education_degree'
    | 'source'
    | 'country'

/**
 * This context is injected in each and every requests.
 */
export interface RequestContext {
    db: Db
    redisClient?: any
    isDebug?: Boolean
    entities: Entity[]
}

export type WatchedItem = 'locales' | 'entities' | 'surveys' | 'projects'

export interface SurveyConfig {
    id: string
    // survey: SurveyType
}

export * from './demographics'
export * from './entity'
export * from './features'
export * from './github'
export * from './surveys'
export * from './tools'
export * from './locale'
export * from './compute'
export * from './filters'
