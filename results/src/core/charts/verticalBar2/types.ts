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
    getPointValue?: (point: PointData, chartState: ChartStateType) => number
    getBucketValue?: (bucket: Bucket) => number
    dataFilters?: DataFilter[]
    /**
     * Generate list of ids for all columns
     */
    getColumnIds?: (lineItems: LineItem<PointData>[]) => string[]
}

export type VerticalBarViewProps<ChartStateType> = {
    chartState: ChartStateType
    block: BlockVariantDefinition
}

export interface VerticalBarChartValues extends ChartValues {
    totalColumns: number
    columnIds: string[]
    ticks?: Tick[]
    maxValue: number
}

export type DataFilter = (buckets: Bucket[]) => Bucket[]

export type ColumnComponentProps<PointData extends BasicPointData> =
    VerticalBarViewProps<PointData> & {
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
