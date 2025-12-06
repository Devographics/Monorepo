import { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import {
    ChartStateWithSort,
    ChartValues,
    ColumnModes,
    SerieMetadata,
    SeriesMetadata,
    Tick,
    ViewDefinition
} from '../common2/types'
import { FacetItem } from 'core/filters/types'
import { IconProps } from '@devographics/icons'
import { Bucket, FacetBucket, QuestionMetadata, ResponseEditionMetadata } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { Dimension } from '../multiItemsExperience/types'

export interface HorizontalBarChartState extends ChartStateWithSort {
    view: HorizontalBarViews
    setView: Dispatch<SetStateAction<HorizontalBarViews>>
    viewDefinition: HorizontalBarViewDefinition<HorizontalBarChartState>
    columnMode: ColumnModes
    setColumnMode: Dispatch<SetStateAction<ColumnModes>>
    facet?: FacetItem
    rowsLimit: number
    setRowsLimit: Dispatch<SetStateAction<number>>
}

export enum HorizontalBarViews {
    BOXPLOT = 'percentilesByFacet',
    PERCENTAGE_BUCKET = 'percentageBucket',
    PERCENTAGE_QUESTION = 'percentageQuestion',
    PERCENTAGE_SURVEY = 'percentageSurvey',
    FACET_COUNTS = 'facetCounts',
    COUNT = 'count',
    AVERAGE = 'average'
}

export interface HorizontalBarChartValues extends ChartValues {
    maxOverallValue?: number
    totalRespondents: number
    totalResponses: number
    totalRows: number
    facetQuestion?: QuestionMetadata
    ticks?: Tick[]
}

export type Control = {
    id: string
    labelId: string
    isChecked?: boolean
    icon: (props: IconProps) => React.JSX.Element
    onClick: (e: SyntheticEvent) => void
}

type GetValueType = (bucket: Bucket | FacetBucket) => number

export type HorizontalBarViewDefinition<ChartStateType> = ViewDefinition<ChartStateType> & {
    getValue: GetValueType
    dataFilters?: DataFilter[]
    component: (props: HorizontalBarViewProps) => JSX.Element | null
}

export enum OtherBucketsType {
    PREVIOUS_EDITION = 'previous_edition',
    DIFFERENT_SERIE = 'different_serie'
}

export type HorizontalBarViewProps = {
    chartState: HorizontalBarChartState
    chartValues: HorizontalBarChartValues
    buckets: Bucket[]
    // other set of buckets to compare the main buckets to
    otherBuckets?: Bucket[]
    otherBucketsType?: OtherBucketsType
    block: BlockVariantDefinition
    isReversed?: boolean
    seriesMetadata: SeriesMetadata
    // metadata about the API response
    serieMetadata: ResponseEditionMetadata
    // metadata about completion, average, etc.
    serieMetadataProps: SerieMetadata
    viewDefinition: HorizontalBarViewDefinition<HorizontalBarChartState>
}

export type DataFilter = (buckets: Bucket[]) => Bucket[]

export type RowComponent = (props: RowComponentProps) => JSX.Element | null

export type RowGroupProps = HorizontalBarViewProps & {
    rowComponent: RowComponent
    bucket: Bucket
    rowIndex: number
    showCount?: boolean
    allRowsCellDimensions?: Dimension[][]
    allRowsOffsets?: number[]
    depth?: number
    isNestedBucket?: boolean
    isLastChild?: boolean
}

export type RowComponentProps = Omit<RowGroupProps, 'rowComponent'> & {
    nestedBuckets?: Bucket[]
    hasNestedBuckets?: boolean
    showNestedBuckets: boolean
    setShowNestedBuckets: Dispatch<SetStateAction<boolean>>
    isNestedBucket?: boolean
    viewDefinition: HorizontalBarViewDefinition<HorizontalBarChartState>
    depth?: number
    isLastChild?: boolean
}
