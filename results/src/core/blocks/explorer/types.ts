export type Key = string

export interface Completion {
    count: number
    percentage_survey: number
    percentage_question: number
}

export interface ExplorerDataBucket {
    count: number
    id: string
    completion: Completion
    fromCount?: number
    toCount?: number
    columnIndex?: number
}
export interface ExplorerDataFacet {
    buckets: ExplorerDataBucket[]
    id: string
    completion: Completion
    fromCount?: number
    toCount?: number
    rowIndex?: number
}

export interface ExplorerDataYear {
    facets: ExplorerDataFacet[]
    year: number
}

export interface ExplorerData {
    keys1: Key[]
    keys2: Key[]
    all_years: ExplorerDataYear[]
}

export interface Dot {
    i: number
    visible?: boolean
    x: number
    y: number
    xAbs: number
    yAbs: number
    rowIndex?: number
    columnIndex?: number
    dotIndex?: number
}

export type AxisType = 'x' | 'y'

export interface Total {
    id: Key
    total: number
}

export interface CommonProps {
    facets: ExplorerDataFacet[]
    keys1: Key[]
    keys2: Key[]
    totals1: Total[]
    totals2: Total[]
}
