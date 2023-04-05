import { Entity, Bucket, ExplorerData } from '@devographics/types'

export type Key = string

export interface Completion {
    count: number
    percentageSurvey: number
    percentageQuestion: number
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
    count: number
    percentage: number
}

export interface CommonProps {
    data: ExplorerData
    query: string
    buckets: Bucket[]
    xKeys: Key[]
    yKeys: Key[]
    xTotals: Total[]
    yTotals: Total[]
    totalCount: number
    stateStuff: any
    entities: Entity[]
    useMobileLayout: boolean
    showCellCountsOverride: boolean
    addModals: boolean
}

export type UnitType = 'count' | 'percentage'

export type DotTypeEnum = 'normal' | 'extra' | 'missing'

export interface DotType {
    index?: number
    type: DotTypeEnum
}
