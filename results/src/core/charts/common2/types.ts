import { Bucket, QuestionMetadata } from '@devographics/types'
import { Dispatch, SetStateAction } from 'react'
import { ChartValues, Dimension } from '../multiItemsExperience/types'
import { BlockVariantDefinition, PageContextValue } from 'core/types'
import { ChartState } from '../horizontalBar2/types'
import { DataSeries } from 'core/filters/types'
import { CustomVariant } from 'core/filters/helpers'

export type RowComponent = (props: any) => JSX.Element | null

export type RowCommonProps = {
    buckets: Bucket[]
    bucket: Bucket
    block: BlockVariantDefinition
    rowIndex: number
    allRowsCellDimensions: Dimension[][]
    allRowsOffsets: number[]
}

export type RowExtraProps = {
    containerWidth: number
    isGroupedBucket?: boolean
    showGroupedBuckets?: boolean
    setShowGroupedBuckets?: Dispatch<SetStateAction<boolean>>
    component: (props: {
        containerWidth: number | undefined
        contentWidth: number | undefined
    }) => JSX.Element
}

export enum OrderOptions {
    ASC = 'asc',
    DESC = 'desc'
}

export enum ColumnModes {
    SPLIT = 'split',
    STACKED = 'stacked'
}

export type CommonProps = {
    pageContext: PageContextValue
    chartState: ChartState
    block: BlockVariantDefinition
    series: DataSeries<any>[]
    variant?: CustomVariant
    question: QuestionMetadata
}

export type ViewProps = CommonProps & {
    buckets: Bucket[]
    chartValues: ChartValues
}
