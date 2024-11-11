import { Db } from 'mongodb'
import { Entity, Locale } from '@devographics/types'

/**
 * This context is injected in each and every requests.
 */
export interface RequestContext {
    db: Db
    redisClient?: any
    isDebug?: Boolean
    entities?: Entity[]
    locales?: Locale[]
    disableCache?: boolean
}

export type WatchedItem = 'locales' | 'entities' | 'surveys' | 'projects'

export * from './demographics'
export * from './surveys'
export * from './compute'
export * from './filters'
export * from './generate'
