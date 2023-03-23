import { NO_ANSWER } from '@devographics/constants'
import { Bucket } from '@devographics/types'

export const moveNoAnswerBucket = (buckets: Bucket[], moveTo = 'start') => {
    const noAnswerBucket = buckets.find(b => b.id === NO_ANSWER)
    const otherBuckets = buckets.filter(b => b.id !== NO_ANSWER)
    return moveTo === 'start'
        ? [noAnswerBucket, ...otherBuckets]
        : [...otherBuckets, noAnswerBucket]
}
