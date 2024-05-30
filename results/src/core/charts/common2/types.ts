import { Bucket, QuestionMetadata } from '@devographics/types'
import { Dispatch, SetStateAction } from 'react'
import { MultiItemsChartValues, Dimension } from '../multiItemsExperience/types'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { HorizontalBarChartState, HorizontalBarViewProps } from '../horizontalBar2/types'
import { DataSeries } from 'core/filters/types'
import { CustomVariant } from 'core/filters/helpers'

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
}
