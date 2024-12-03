import { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import { ChartState, ChartValues, Tick, ViewDefinition } from '../common2/types'
import { IconProps } from 'core/icons/IconWrapper'
import {
    Bucket,
    Entity,
    QuestionMetadata,
    ResponseEditionData,
    StandardQuestionData
} from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { DataSeries } from 'core/filters/types'

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

export type VerticalBarViewDefinition<
    SerieData,
    PointData extends BasicPointData,
    ChartState
> = ViewDefinition & {
    /**
     * Takes a serie and return all line objects
     */
    getLineItems: ({
        serie,
        question,
        chartState
    }: {
        serie: DataSeries<SerieData>
        question: QuestionMetadata
        chartState: ChartState
    }) => LineItem<PointData>[]
    /**
     * Takes a point object and return its value
     */
    getPointValue?: (point: PointData, chartState: ChartState) => number
    getBucketValue?: (bucket: Bucket) => number
    dataFilters?: DataFilter[]
    component: (props: VerticalBarViewProps<PointData>) => JSX.Element | null
    /**
     * Generate list of ids for all columns
     */
    getColumnIds?: (lineItems: LineItem<PointData>[]) => string[]
}

export type VerticalBarViewProps<PointData extends BasicPointData> = {
    chartState: VerticalBarChartState
    chartValues: VerticalBarChartValues
    lineItems: LineItem<PointData>[]
    block: BlockVariantDefinition
}

export interface VerticalBarChartValues extends ChartValues {
    totalColumns: number
    columnIds: string[]
    ticks?: Tick[]
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

export type BasicPointData = {
    id: string
    columnIndex: number
}

export type EditionWithPointData = ResponseEditionData & BasicPointData

export type LineItem<PointData extends BasicPointData> = {
    id: string
    entity?: Entity
    points: Array<PointData>
}

export type LineComponentProps<PointData extends BasicPointData> = VerticalBarViewProps<PointData> &
    LineItem<PointData> & {
        lineIndex: number
        width: number
        height: number
        hasMultiple?: boolean
    }
