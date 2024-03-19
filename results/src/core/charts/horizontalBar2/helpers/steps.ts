import { Bucket } from '@devographics/types'
import { Step } from '../types'
import { NOT_APPLICABLE, NO_ANSWER, OVERALL } from '@devographics/constants'

export const applySteps = (buckets: Bucket[], steps: Step[]) => {
    return steps.reduce((obj, func) => func(obj), buckets)
}

export const removeNoAnswer: Step = buckets => {
    return buckets.filter(b => b.id !== NO_ANSWER)
}

export const removeOverall: Step = buckets => {
    return buckets.filter(b => b.id !== OVERALL)
}

export const removeNotApplicable: Step = buckets => {
    return buckets.filter(b => b.id !== NOT_APPLICABLE)
}
