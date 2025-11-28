import { Dispatch, SetStateAction } from 'react'
import {
    Bucket,
    Entity,
    FacetBucket,
    FeaturesOptions,
    QuestionMetadata,
    SimplifiedSentimentOptions,
    StandardQuestionData,
    OrderOptions
} from '@devographics/types'
import { BlockComponentProps } from 'core/types'
import { PERCENTAGE_QUESTION, SENTIMENT_FACET } from '@devographics/constants'
import {
    ChartStateWithFilter,
    ChartStateWithSort,
    ChartValues,
    ColumnModes,
    Tick
} from '../common2/types'
import { DataSeries } from 'core/filters/types'

export const DEFAULT_VARIABLE = PERCENTAGE_QUESTION

export enum GroupingOptions {
    EXPERIENCE = 'experience',
    SENTIMENT = 'sentiment'
}

export type MultiItemSerie = DataSeries<StandardQuestionData[]>

export const COMMENTS = 'comments' as const
export type ColumnId = FeaturesOptions | SimplifiedSentimentOptions | typeof COMMENTS

export type Variable = typeof PERCENTAGE_QUESTION

export type FacetId = string

export interface MultiItemsChartState extends ChartStateWithFilter {
    facetId: FacetId
    setFacetId: Dispatch<SetStateAction<FacetId>>
    grouping: GroupingOptions
    setGrouping: Dispatch<SetStateAction<GroupingOptions>>
    variable: Variable
    setVariable: Dispatch<SetStateAction<Variable>>
    columnMode: ColumnModes
    setColumnMode: Dispatch<SetStateAction<ColumnModes>>
    rowsLimit: number
    setRowsLimit: Dispatch<SetStateAction<number>>
}

export interface MultiItemsChartValues extends ChartValues {
    maxOverallValue?: number
    totalRows: number
    facetQuestion?: QuestionMetadata
    ticks?: Tick[]
}

export type CombinedItem = {
    id: string
    entity: Entity
    combinedBuckets: CombinedBucket[]
    commentsCount: number
    count: number
    _metadata: QuestionMetadata
}

export type CombinedBucket = {
    id: string
    ids: string[]
    bucket: Bucket
    facetBucket: FacetBucket
    count: number
    value: number
    groupIndex: number
    subGroupIndex: number
}

type ValueSuffix = '__value'
type CountSuffix = '__count'

export type ValueKey = `${ColumnId}${ValueSuffix}`
export type CountKey = `${ColumnId}${CountSuffix}`

export type Totals = { id: string } & { [key in ColumnId as `${key}${ValueSuffix}`]: number } & {
    [key in ColumnId as `${key}${CountSuffix}`]: number
}

export type MaxValue = { id: ColumnId; maxValue: number }

export type Dimension = {
    id: CombinedBucket['id']
    width: number
    offset: number
}
export type CellDimension = Dimension & {
    ids: CombinedBucket['ids']
}

export type ColumnDimension = Dimension

export type RowDataProps = {
    bucket: Bucket
    chartState: MultiItemsChartState
    chartValues: MultiItemsChartValues
}
