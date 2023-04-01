import { BucketUnits, RatiosUnits, OtherPercentages } from '@devographics/types'
export const percentageUnits = [
    RatiosUnits.SATISFACTION,
    RatiosUnits.INTEREST,
    RatiosUnits.USAGE,
    RatiosUnits.AWARENESS,
    RatiosUnits.USAGE,
    OtherPercentages.WOULD_NOT_USE_PERCENTAGE,
    OtherPercentages.NOT_INTERESTED_PERCENTAG,
    OtherPercentages.WOULD_USE_PERCENTAGE,
    OtherPercentages.INTERESTED_PERCENTAGE,
    BucketUnits.PERCENTAGE_QUESTION,
    BucketUnits.PERCENTAGE_SURVEY,
    BucketUnits.PERCENTAGE_BUCKET
]

export const isPercentage = (units: BucketUnits | RatiosUnits | OtherPercentages) =>
    percentageUnits.includes(units)

export type MetricId = 'satisfaction' | 'interest' | 'usage' | 'awareness'

export const ALL_METRICS = Object.values(RatiosUnits)
