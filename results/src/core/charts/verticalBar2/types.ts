import { Dispatch, SetStateAction, SyntheticEvent } from 'react'
import { ChartValues, Tick, ViewDefinition } from '../common2/types'
import { IconProps } from 'core/icons/IconWrapper'
import { Bucket, Entity, QuestionMetadata, ResponseEditionData } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import { DataSeries } from 'core/filters/types'

export interface VerticalBarChartState {
    view: string
    setView: Dispatch<SetStateAction<string>>
    highlighted: string | null
    setHighlighted: Dispatch<SetStateAction<string | null>>
}

export enum VerticalBarViewsEnum {
    PERCENTAGE_QUESTION = 'percentageQuestion',
    AVERAGE = 'average',
    COUNT = 'count'
}

export type Control = {
    id: string
    labelId: string
    isChecked?: boolean
    icon: (props: IconProps) => React.JSX.Element
    onClick: (e: SyntheticEvent) => void
}

type TickItem = {
    value: number
}

export type VerticalBarViewDefinition<
    /**
     * Type for the kind of data each data serie uses
     */
    SerieData,
    /**
     * Type for the kind of data a single point of a line uses
     */
    PointData extends BasicPointData,
    /**
     * Chart state type
     */
    ChartStateType
> = ViewDefinition<ChartStateType> & {
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
        chartState: ChartStateType
    }) => LineItem<PointData>[]
    /**
     * Takes a point object and return its value
     */
    getPointValue: (point: PointData, chartState: ChartStateType) => number
    getBucketValue?: (bucket: Bucket) => number
    dataFilters?: DataFilter[]
    /**
     * Generate list of ids for all columns
     */
    getColumnIds: (lineItems: LineItem<PointData>[]) => string[]
    formatColumn: ({ columnId, columnIndex }: { columnId: string; columnIndex: number }) => string
    component?: (
        props: VerticalBarViewComponentProps<SerieData, PointData, ChartStateType>
    ) => JSX.Element | null
}

export type VerticalBarViewComponentProps<
    SerieData,
    PointData extends BasicPointData,
    ChartStateType
> = {
    question: QuestionMetadata
    serie: DataSeries<SerieData>
    chartState: ChartStateType
    block: BlockVariantDefinition
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
}

export interface VerticalBarChartValues extends ChartValues {
    totalColumns: number
    columnIds: string[]
    ticks?: Tick[]
    maxValue: number
    maxTick?: number
}

export type DataFilter = (buckets: Bucket[]) => Bucket[]

export type ColumnComponentProps<PointData extends BasicPointData> =
    VerticalBarViewComponentProps<PointData> & {
        edition: ResponseEditionData
        columnIndex: number
        columnId: string
        showCount?: boolean
    }

export type EmptyColumnProps<PointData extends BasicPointData> = Omit<
    ColumnComponentProps<PointData>,
    'edition' | 'editions' | 'chartState'
>

export type BasicPointData = {
    id: string
    columnId: string
    columnIndex: number
}

export type EditionWithPointData = ResponseEditionData & BasicPointData

export type LineItem<PointData extends BasicPointData> = {
    id: string
    entity?: Entity
    points: Array<PointData>
}
