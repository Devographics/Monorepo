import { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import { ColumnModes, OrderOptions } from '../common2/types'
import { ChartValues } from '../multiItemsExperience/types'
import { FacetItem } from 'core/filters/types'
import { IconProps } from 'core/icons/IconWrapper'
import { Bucket, FacetBucket } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'

export type ChartState = {
    sort: string | undefined
    setSort: Dispatch<SetStateAction<string | undefined>>
    view: Views
    setView: Dispatch<SetStateAction<Views>>
    order: OrderOptions
    setOrder: Dispatch<SetStateAction<OrderOptions>>
    columnMode: ColumnModes
    setColumnMode: Dispatch<SetStateAction<ColumnModes>>
    facet: FacetItem | undefined
    setFacet: Dispatch<SetStateAction<FacetItem | undefined>>
    rowsLimit: number
    setRowsLimit: Dispatch<SetStateAction<number>>
}

export type RowDataProps = { chartState: ChartState; chartValues: ChartValues }

export enum Views {
    BOXPLOT = 'percentilesByFacet',
    PERCENTAGE_BUCKET = 'percentageBucket',
    PERCENTAGE_QUESTION = 'percentageQuestion',
    FACET_COUNTS = 'facetCounts',
    COUNT = 'count',
    AVERAGE = 'average'
}

export type Control = {
    id: string
    labelId: string
    isChecked?: boolean
    icon: (props: IconProps) => React.JSX.Element
    onClick: (e: SyntheticEvent) => void
}

export type GetValueType = (bucket: Bucket | FacetBucket) => number
export type ViewDefinition = {
    getValue?: GetValueType
    steps?: Step[]
    showLegend?: boolean
    component: (props: ViewProps) => JSX.Element | null
}

export type ViewProps = {
    chartState: ChartState
    chartValues: ChartValues
    buckets: Bucket[]
    block: BlockVariantDefinition
}

export type Step = (buckets: Bucket[]) => Bucket[]
