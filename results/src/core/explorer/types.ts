import { Entity } from '@types/index'

export type Key = string

export interface Completion {
    count: number
    percentageSurvey: number
    percentageQuestion: number
}

export interface ExplorerDataBucket {
    count: number
    id: string
    completion: Completion
    fromCount?: number
    toCount?: number
    columnIndex?: number
    percentageFacet: number
    percentageQuestion: number
    percentageSurvey: number
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
    all_years?: ExplorerDataYear[]
    year?: ExplorerDataYear
}

export interface ExplorerDataFormatted {
    keys1: Key[]
    keys2: Key[]
    all_years: ExplorerDataYear[]
}

export interface DotTypeOld {
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
    data: any
    query: string
    facets: ExplorerDataFacet[]
    keys1: Key[]
    keys2: Key[]
    xTotals: Total[]
    yTotals: Total[]
    totalCount: number
    stateStuff: any
    entities: Entity[]
    useMobileLayout: boolean
}

export type UnitType = 'count' | 'percentage'

export type DotTypeEnum = 'normal' | 'extra' | 'missing'

export interface DotType {
    index?: number
    type: DotTypeEnum
}
