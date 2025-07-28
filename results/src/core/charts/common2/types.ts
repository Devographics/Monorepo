import {
    Bucket,
    Entity,
    FacetBucket,
    QuestionMetadata,
    ResponseEditionMetadata,
    YearCompletion
} from '@devographics/types'
import { MultiItemsChartValues } from '../multiItemsExperience/types'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { DataSeries } from 'core/filters/types'
import { CustomVariant } from 'core/filters/helpers'
import { Dispatch, SetStateAction } from 'react'

export type ChartStateWithSubset = {
    subset: string | number | null
    setSubset: Dispatch<SetStateAction<string | number | null>>
}

export type ChartStateWithHighlighted = ChartStateWithSubset & {
    highlighted: string | number | null
    setHighlighted: Dispatch<SetStateAction<string | number | null>>
}

export interface ChartStateWithHighlightedRow {
    highlightedRow: string | number | null
    setHighlightedRow: Dispatch<SetStateAction<string | number | null>>
    highlightedCell: string | number | null
    setHighlightedCell: Dispatch<SetStateAction<string | number | null>>
}
export interface ChartStateWithView<ViewType> extends ChartStateWithHighlightedRow {
    view: string
    setView: Dispatch<SetStateAction<ViewType>>
}

export interface ChartStateWithSort extends ChartStateWithHighlightedRow {
    sort: string | undefined
    setSort: Dispatch<SetStateAction<string | undefined>>
    order: OrderOptions
    setOrder: Dispatch<SetStateAction<OrderOptions>>
}

export interface ChartStateWithFilter extends ChartStateWithSort {
    filter: string | undefined
    setFilter: Dispatch<SetStateAction<string | undefined>>
}

export type SerieMetadataProps = {
    average: number | undefined
    median: number | undefined
    completion: YearCompletion
}

export interface ChartValues {
    question: QuestionMetadata
    i18nNamespace?: string
    serieMetadata: ResponseEditionMetadata
    serieMetadataProps: SerieMetadataProps
}

export type GetTicksType = ({
    maxValue,
    contentWidth,
    buckets,
    seriesMetadata
}: {
    maxValue: number
    contentWidth?: number
    buckets?: Bucket[]
    seriesMetadata?: SeriesMetadata
}) => Tick[]

export type ViewDefinition<ChartStateType> = {
    formatValue: FormatValueType<ChartStateType>
    getTicks?: GetTicksType
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
    REGULAR = 'regular',
    SPLIT = 'split',
    STACKED = 'stacked'
}

export type MetadataProps = {
    average?: number
    median?: number
    completion?: YearCompletion
}

export type CommonProps<ChartStateType> = {
    pageContext: PageContextValue
    chartState: ChartStateType
    block: BlockVariantDefinition
    series: DataSeries<any>[]
    variant?: CustomVariant
    question?: QuestionMetadata
    seriesMetadata: SeriesMetadata
    facetQuestion?: QuestionMetadata
    facetBuckets?: FacetBucket[]
    metadataProps: MetadataProps
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
    seriesMaxBucketCount: number
    totalRespondents: number
    totalResponses: number
}

export interface SerieMetadata {
    completion?: YearCompletion
    average?: number
    median?: number
    total?: number
}
