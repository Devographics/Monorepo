import { Bucket } from '@devographics/types'
import { Dispatch, SetStateAction } from 'react'
import { ChartValues } from '../multiItemsExperience/types'
import { BlockDefinition } from 'core/types'
import { ChartState } from '../horizontalBar2/types'

export type RowCommonProps = {
    buckets: Bucket[]
    bucket: Bucket
    block: BlockDefinition
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
    buckets: Bucket[]
    chartState: ChartState
    block: BlockDefinition
    chartValues: ChartValues
}
