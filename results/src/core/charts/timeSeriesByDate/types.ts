import { Bucket } from '@devographics/types'
import { BasicPointData, VerticalBarChartState } from '../verticalBar2/types'

export type TimeSeriesByDateChartState = VerticalBarChartState

export type DateBucketWithPointData = Bucket & BasicPointData & { date: number }
