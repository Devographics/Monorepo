import { Bucket } from '@devographics/types'
import { DataFilter } from '../types'
import {
    CUTOFF_ANSWERS,
    NOT_APPLICABLE,
    NO_ANSWER,
    OTHER_ANSWERS,
    OVERALL,
    OVERLIMIT_ANSWERS
} from '@devographics/constants'

export const applySteps = (buckets: Bucket[], steps: DataFilter[]) => {
    return steps.reduce((obj, func) => func(obj), buckets)
}

export const removeOtherAnswers: DataFilter = buckets => {
    return buckets.filter(b => b.id !== OTHER_ANSWERS)
}

export const removeNoAnswer: DataFilter = buckets => {
    return buckets.filter(b => b.id !== NO_ANSWER)
}

export const removeOverall: DataFilter = buckets => {
    return buckets.filter(b => b.id !== OVERALL)
}

export const removeNotApplicable: DataFilter = buckets => {
    return buckets.filter(b => b.id !== NOT_APPLICABLE)
}

export const removeOverLimit: DataFilter = buckets => {
    return buckets.filter(b => b.id !== OVERLIMIT_ANSWERS)
}

export const removeUnderCutoff: DataFilter = buckets => {
    return buckets.filter(b => b.id !== CUTOFF_ANSWERS)
}
