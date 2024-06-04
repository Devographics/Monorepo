import { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import { ChartState, Tick, ViewDefinition } from '../common2/types'
import { IconProps } from 'core/icons/IconWrapper'
import { Bucket, Entity, QuestionMetadata, ResponseEditionData } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'

export interface VerticalBarChartState extends ChartState {
    viewDefinition: VerticalBarViewDefinition
    highlighted: string | null
    setHighlighted: Dispatch<SetStateAction<string | null>>
}

export enum VerticalBarViews {
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

export type VerticalBarViewDefinition = ViewDefinition & {
    getEditionValue?: (edition: ResponseEditionData, chartState: VerticalBarChartState) => number
    getBucketValue?: (bucket: Bucket) => number
    dataFilters?: DataFilter[]
    component: (props: VerticalBarViewProps) => JSX.Element | null
    invertYAxis?: boolean
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
    years: number[]
    maxValue: number
}

export type DataFilter = (buckets: Bucket[]) => Bucket[]

export type ColumnComponentProps = VerticalBarViewProps & {
    year: number
    edition: ResponseEditionData
    columnIndex: number
    showCount?: boolean
}

export type EmptyColumnProps = Omit<ColumnComponentProps, 'edition' | 'editions' | 'chartState'>

export type EditionWithRank = ResponseEditionData & {
    rank: number
}

export type LineItem = {
    id: string
    entity?: Entity
    editions: Array<EditionWithRank>
}

export type LineComponentProps = VerticalBarViewProps &
    LineItem & {
        lineIndex: number
        width: number
        height: number
    }
