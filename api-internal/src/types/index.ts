/**
 * This context is injected in each and every requests.
 */
export interface RequestContext {
    isDebug?: Boolean
}

export * from './entity'
export * from './github'
export * from './locale'
