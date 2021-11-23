export type Units = 'percentage_question' | 'percentage_facet' | 'percentage_survey' | 'count'

export type Mode = 'relative' | 'absolute'

export const percentageUnits = ['percentage_question', 'percentage_facet', 'percentage_survey']

export const isPercentage = (units: Units) => percentageUnits.includes(units)