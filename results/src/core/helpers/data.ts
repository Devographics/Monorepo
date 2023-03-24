import { NO_ANSWER, PERCENTAGE_QUESTION } from '@devographics/constants'
import { Bucket } from '@devographics/types'
import { BlockUnits } from '../types/block'

interface HandleNoAnswerBucketOptions {
    buckets: Bucket[]
    units?: BlockUnits
    moveTo?: string
    remove?: boolean
}

export const handleNoAnswerBucket = (options: HandleNoAnswerBucketOptions) => {
    const { buckets, units, moveTo = 'start', remove } = options
    const otherBuckets = buckets.filter(b => b.id !== NO_ANSWER)
    const noAnswerBucket = buckets.find(b => b.id === NO_ANSWER)

    if (noAnswerBucket) {
        if (remove || units === PERCENTAGE_QUESTION) {
            return otherBuckets
        } else {
            return moveTo === 'start'
                ? [noAnswerBucket, ...otherBuckets]
                : [...otherBuckets, noAnswerBucket]
        }
    } else {
        return buckets
    }
}
