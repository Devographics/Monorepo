import { BlockUnits } from 'core/types'

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
    'percentage_question',
    'percentage_facet',
    'percentage_survey'
]

export const isPercentage = (units: BlockUnits) => percentageUnits.includes(units)
