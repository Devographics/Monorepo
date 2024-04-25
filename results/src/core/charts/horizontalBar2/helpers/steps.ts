import { Bucket } from '@devographics/types'
import { Step } from '../types'
import {
    NOT_APPLICABLE,
    NO_ANSWER,
    OTHER_ANSWERS,
    OVERALL,
    OVERLIMIT_ANSWERS
} from '@devographics/constants'

export const applySteps = (buckets: Bucket[], steps: Step[]) => {
    return steps.reduce((obj, func) => func(obj), buckets)
}

export const removeOtherAnswers: Step = buckets => {
    return buckets.filter(b => b.id !== OTHER_ANSWERS)
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

export const removeOverLimit: Step = buckets => {
    return buckets.filter(b => b.id !== OVERLIMIT_ANSWERS)
}
