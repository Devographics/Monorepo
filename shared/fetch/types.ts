import { AppName } from '@devographics/types'

export enum CacheType {
    REDIS = 'redis',
    MONGODB = 'mongodb'
}

export enum SourceType {
    REDIS = 'redis',
    MONGODB = 'MONGODB',
    MEMORY = 'memory',
    API = 'api'
}

export interface CommonOptions {
    calledFrom?: 'surveyform' | 'charts' | string
    getServerConfig?: () => { isProd?: boolean; isTest?: boolean; isDev?: boolean }
    redisUrl?: string
    redisToken?: string
    shouldGetFromCache?: boolean
    shouldUpdateCache?: boolean
    shouldThrow?: boolean
    shouldCompress?: boolean
    cacheType?: CacheType
}

export interface GetFromCacheOptions<T> extends CommonOptions {
    key: string
    fetchFunction: () => Promise<T>
}

export interface FetcherFunctionOptions extends CommonOptions {
    appName?: AppName
    getQuery?: (options?: any) => string
    redisUrl?: string
    redisToken?: string
}
