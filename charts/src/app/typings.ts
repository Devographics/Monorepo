/**
 * Copied from surveyform 
 */

import { ReactNode } from "react"

export interface NextPageParams<TParams = any, TSearchParams = any> {
    params: TParams
    searchParams: Partial<TSearchParams>
}
export interface NextLayoutParams<TParams = any> {
    params: TParams,
    children: ReactNode
}