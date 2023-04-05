import { Db } from 'mongodb'
import { Entity } from '@devographics/core-models'

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

export * from './demographics'
export * from './surveys'
export * from './compute'
export * from './filters'
