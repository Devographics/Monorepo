import { Bucket, Entity, FacetBucket, QuestionMetadata } from '@devographics/types'
import { MultiItemsChartValues } from '../multiItemsExperience/types'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { DataSeries } from 'core/filters/types'
import { CustomVariant } from 'core/filters/helpers'
import { Dispatch, SetStateAction } from 'react'

export interface ChartStateWithView<ViewType> {
    view: string
    setView: Dispatch<SetStateAction<ViewType>>
}

export interface ChartStateWithSort {
    sort: string | undefined
    setSort: Dispatch<SetStateAction<string | undefined>>
    order: OrderOptions
    setOrder: Dispatch<SetStateAction<OrderOptions>>
}

export interface ChartStateWithFilter extends ChartStateWithSort {
    filter: string | undefined
    setFilter: Dispatch<SetStateAction<string | undefined>>
}

export interface ChartValues {
    question: QuestionMetadata
    i18nNamespace?: string
}

export type ViewDefinition<ChartStateType> = {
    formatValue: FormatValueType<ChartStateType>
    getTicks?: (maxValue?: number) => Tick[]
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
    question?: QuestionMetadata
    seriesMetadata?: SeriesMetadata
    facetQuestion?: QuestionMetadata
    facetOptions?: FacetBucket[]
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

export type FormatValueType<ChartStateType> = (
    v: number,
    question: QuestionMetadata,
    chartState: ChartStateType
) => string

export type LegendItem = {
    id: string
    label?: string
    color?: string
    entity?: Entity
}

export interface SeriesMetadata {
    seriesMaxValue: number
    totalRespondents: number
    totalResponses: number
}
