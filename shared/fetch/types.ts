import { AppName } from '@devographics/types'

export interface CommonOptions {
    calledFrom?: string
    serverConfig?: Function
    shouldGetFromCache?: boolean
    shouldUpdateCache?: boolean
    shouldThrow?: boolean
}

export interface GetFromCacheOptions<T> extends CommonOptions {
    key: string
    fetchFunction: () => Promise<T>
}

export interface FetcherFunctionOptions extends CommonOptions {
    appName?: AppName
    getQuery?: (options?: any) => string
}
