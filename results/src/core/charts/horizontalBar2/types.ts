import { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import { ChartState, ColumnModes, OrderOptions, Tick } from '../common2/types'
import { FacetItem } from 'core/filters/types'
import { IconProps } from 'core/icons/IconWrapper'
import { Bucket, FacetBucket, QuestionMetadata } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { Dimension } from '../multiItemsExperience/types'

export interface HorizontalBarChartState extends ChartState {
    sort: string | undefined
    setSort: Dispatch<SetStateAction<string | undefined>>
    order: OrderOptions
    setOrder: Dispatch<SetStateAction<OrderOptions>>
    columnMode: ColumnModes
    setColumnMode: Dispatch<SetStateAction<ColumnModes>>
    facet: FacetItem | undefined
    setFacet: Dispatch<SetStateAction<FacetItem | undefined>>
    rowsLimit: number
    setRowsLimit: Dispatch<SetStateAction<number>>
}

export type HorizontalBarChartValues = {
    maxOverallValue?: number
    totalRows: number
    question: QuestionMetadata
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
export type HorizontalBarViewDefinition = {
    getValue?: GetValueType
    getTicks?: (values: number[]) => Tick[]
    dataFilters?: DataFilter[]
    showLegend?: boolean
    component: (props: HorizontalBarViewProps) => JSX.Element | null
}

export type HorizontalBarViewProps = {
    chartState: HorizontalBarChartState
    chartValues: HorizontalBarChartValues
    buckets: Bucket[]
    block: BlockVariantDefinition
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
}

export type RowComponentProps = Omit<RowGroupProps, 'rowComponent'> & {
    hasGroupedBuckets?: boolean
    showGroupedBuckets?: boolean
    setShowGroupedBuckets?: Dispatch<SetStateAction<boolean>>
    isGroupedBucket?: boolean
}
