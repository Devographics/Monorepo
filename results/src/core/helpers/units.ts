import { BlockUnits } from '@types/index'

export const percentageUnits = [
    'percentage',
    'satisfaction_percentage',
    'interest_percentage',
    'usage_percentage',
    'awareness_percentage',
    'usage_ratio',
    'would_not_use_percentage',
    'not_interested_percentage',
    'would_use_percentage',
    'interested_percentage',
    'percentageQuestion',
    'percentageFacet',
    'percentageSurvey',
    'percentage_bucket'
]

export const isPercentage = (units: string) => percentageUnits.includes(units)

export type MetricId = 'satisfaction' | 'interest' | 'usage' | 'awareness'

export const ALL_METRICS: MetricId[] = ['satisfaction', 'interest', 'usage', 'awareness']
