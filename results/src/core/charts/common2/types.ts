import { Bucket } from '@devographics/types'
import { ChartState, ChartValues } from '../multiItemsExperience/types'
import { Dispatch, ReactNode, SetStateAction } from 'react'

export type RowProps = {
    bucket: Bucket
    chartState: ChartState
    chartValues: ChartValues
}

export type RowComponentsProps = RowProps & {
    isGroupedBucket?: boolean
    showGroupedBuckets?: boolean
    setShowGroupedBuckets?: Dispatch<SetStateAction<boolean>>
}
