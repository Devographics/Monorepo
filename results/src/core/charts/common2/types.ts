import { Bucket, QuestionMetadata } from '@devographics/types'
import { MultiItemsChartValues } from '../multiItemsExperience/types'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { DataSeries } from 'core/filters/types'
import { CustomVariant } from 'core/filters/helpers'
import { Dispatch, SetStateAction } from 'react'

export interface ChartState {
    view: Views
    setView: Dispatch<SetStateAction<Views>>
}

export enum Views {
    BOXPLOT = 'percentilesByFacet',
    PERCENTAGE_BUCKET = 'percentageBucket',
    PERCENTAGE_QUESTION = 'percentageQuestion',
    FACET_COUNTS = 'facetCounts',
    COUNT = 'count',
    AVERAGE = 'average'
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
