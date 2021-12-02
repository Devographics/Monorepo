import { BlockUnits } from 'core/types'

export const percentageUnits = [
    'percentage',
    'satisfaction_percentage',
    'interest_percentage',
    'usage_ratio',
    'percentage_question',
    'percentage_facet',
    'percentage_survey'
]

export const isPercentage = (units: BlockUnits) => percentageUnits.includes(units)
