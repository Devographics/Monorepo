import { SyntheticEvent } from 'react'
import { ChartState, Tick } from '../common2/types'
import { IconProps } from 'core/icons/IconWrapper'
import { Bucket, QuestionMetadata, ResponseEditionData } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'

export interface VerticalBarChartState extends ChartState {
    foo: number
}

export type Control = {
    id: string
    labelId: string
    isChecked?: boolean
    icon: (props: IconProps) => React.JSX.Element
    onClick: (e: SyntheticEvent) => void
}

export type VerticalBarViewDefinition = {
    getEditionValue?: (edition: ResponseEditionData) => number
    getBucketValue?: (bucket: Bucket) => number
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

export type ColumnComponentProps = VerticalBarViewProps & {
    edition: ResponseEditionData
    columnIndex: number
    showCount?: boolean
}
