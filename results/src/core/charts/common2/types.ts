import { Bucket, Entity, QuestionMetadata } from '@devographics/types'
import { MultiItemsChartValues } from '../multiItemsExperience/types'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { DataSeries } from 'core/filters/types'
import { CustomVariant } from 'core/filters/helpers'
import { Dispatch, SetStateAction } from 'react'

export interface ChartState {
    view: string
    setView: Dispatch<SetStateAction<string>>
    viewDefinition: ViewDefinition
}

export type ViewDefinition = {
    formatValue: FormatValueType
    getTicks?: (values: number[]) => Tick[]
    showLegend?: boolean
}

export enum PercentViews {
    PERCENTAGE_BUCKET = 'percentageBucket',
    PERCENTAGE_QUESTION = 'percentageQuestion'
}

export enum OrderOptions {
    ASC = 'asc',
    DESC = 'desc'
}

export enum ColumnModes {
    SPLIT = 'split',
    STACKED = 'stacked'
}

export type CommonProps<ChartStateType> = {
    pageContext: PageContextValue
    chartState: ChartStateType
    block: BlockVariantDefinition
    series: DataSeries<any>[]
    variant?: CustomVariant
    question: QuestionMetadata
}

export type ViewProps<ChartStateType> = CommonProps<ChartStateType> & {
    buckets: Bucket[]
    chartValues: MultiItemsChartValues
}

export type Tick = {
    value: number
    label?: string
    xOffset?: number
    yOffset?: number
}

export type FormatValueType = (v: number, question: QuestionMetadata) => string

export type LegendItem = {
    id: string
    label?: string
    color?: string
    entity?: Entity
}
