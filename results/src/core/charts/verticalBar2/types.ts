import { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import { Tick } from '../common2/types'
import { IconProps } from 'core/icons/IconWrapper'
import { Bucket, FacetBucket, QuestionMetadata, ResponseEditionData } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'

export type VerticalBarChartState = {
    view: Views
    setView: Dispatch<SetStateAction<Views>>
}

export type ColumnDataProps = {
    chartState: VerticalBarChartState
    chartValues: VerticalBarChartValues
}

export type ColumnCommonProps = {
    block: BlockVariantDefinition
    columnIndex: number
}

export type ColumnExtraProps = {
    component: (props: {
        containerWidth: number | undefined
        contentWidth: number | undefined
    }) => JSX.Element
}

export enum Views {
    PERCENTAGE_QUESTION = 'percentageQuestion',
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
export type VerticalBarViewDefinition = {
    getValue?: GetValueType
    getTicks?: (values: number[]) => Tick[]
    dataFilters?: DataFilter[]
    showLegend?: boolean
    component: (props: VerticalBarViewProps) => JSX.Element | null
}

export type VerticalBarViewProps = {
    chartState: VerticalBarChartState
    chartValues: VerticalBarChartValues
    editions: ResponseEditionData[]
    block: BlockVariantDefinition
}

export type VerticalBarChartValues = {
    totalColumns: number
    question: QuestionMetadata
    ticks?: Tick[]
}

export type DataFilter = (buckets: Bucket[]) => Bucket[]
