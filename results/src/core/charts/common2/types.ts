import { Bucket } from '@devographics/types'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { ChartState, ChartValues } from '../multiItemsExperience/types'
import { BlockDefinition } from 'core/types'

export type RowCommonProps = {
    bucket: Bucket
    block: BlockDefinition
}

export type RowExtraProps = {
    isGroupedBucket?: boolean
    showGroupedBuckets?: boolean
    setShowGroupedBuckets?: Dispatch<SetStateAction<boolean>>
}

export enum OrderOptions {
    ASC = 'asc',
    DESC = 'desc'
}

export enum ColumnModes {
    SPLIT = 'split',
    STACKED = 'stacked'
}
