import { AppName } from '@devographics/types'

export interface FetcherFunctionOptions {
    appName: AppName
    shouldThrow?: boolean
    calledFrom?: string
    serverConfig?: Function
}
