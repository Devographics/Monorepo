import { NO_ANSWER, PERCENTAGE_QUESTION } from '@devographics/constants'
import {
    Bucket,
    EditionMetadata,
    QuestionMetadata,
    SectionMetadata,
    SurveyMetadata
} from '@devographics/types'
import { PageContextValue } from 'core/types'
import { BlockDefinition, BlockUnits } from '../types/block'
import get from 'lodash/get.js'

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

export const getDefaultDataPath = ({
    survey,
    edition,
    section,
    question,
    addRootNode = true
}: {
    survey: SurveyMetadata
    edition: EditionMetadata
    section: SectionMetadata
    question: QuestionMetadata
    addRootNode: boolean
}) =>
    `${addRootNode ? 'dataAPI.' : ''}surveys.${survey.id}.${edition.id}.${section.id}.${
        question.id
    }`

export const getBlockDataPath = ({
    block,
    pageContext,
    addRootNode = true
}: {
    block: BlockDefinition
    pageContext: PageContextValue
    addRootNode?: boolean
}) => {
    const { currentSurvey: survey, currentEdition: edition } = pageContext
    const section = { id: pageContext.id } as SectionMetadata
    const question = block as QuestionMetadata
    const dataPath =
        block.dataPath ||
        getDefaultDataPath({
            survey,
            edition,
            section,
            question,
            addRootNode
        })
    return dataPath
}

export const getBlockData = ({
    block,
    pageContext
}: {
    block: BlockDefinition
    pageContext: PageContextValue
}) => {
    const dataPath = getBlockDataPath({ block, pageContext })
    return get(pageContext.pageData, dataPath)
}
