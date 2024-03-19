import { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import { ColumnModes, OrderOptions } from '../common2/types'
import { ChartValues } from '../multiItemsExperience/types'
import { FacetItem } from 'core/filters/types'
import { IconProps } from 'core/icons/IconWrapper'
import { Bucket } from '@devographics/types'
import { BlockDefinition } from 'core/types'

export type ChartState = {
    sort: string
    setSort: Dispatch<SetStateAction<string>>
    view: Views
    setView: Dispatch<SetStateAction<Views>>
    order: OrderOptions
    setOrder: Dispatch<SetStateAction<OrderOptions>>
    columnMode: ColumnModes
    setColumnMode: Dispatch<SetStateAction<ColumnModes>>
    facet: FacetItem
    setFacet: Dispatch<SetStateAction<FacetItem>>
}

export type RowDataProps = { chartState: ChartState; chartValues: ChartValues }

export enum Views {
    BOXPLOT = 'percentilesByFacet',
    PERCENTAGE_BUCKET = 'percentageBucket',
    PERCENTAGE_QUESTION = 'percentageQuestion',
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

export type ViewProps = {
    chartState: ChartState
    chartValues: ChartValues
    buckets: Bucket[]
    block: BlockDefinition
}
