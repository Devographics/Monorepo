import { NO_ANSWER, PERCENTAGE_QUESTION } from '@devographics/constants'
import {
    Bucket,
    EditionMetadata,
    QuestionMetadata,
    SectionMetadata,
    SurveyMetadata
} from '@devographics/types'
import { PageContextValue } from 'core/types'
import { BlockVariantDefinition, BlockUnits } from '../types/block'
import get from 'lodash/get.js'
import { MODE_FACET } from 'core/filters/constants'
import { CustomizationDefinition, DataSeries } from 'core/filters/types'

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
    suffix = '',
    addRootNode = true
}: {
    survey: SurveyMetadata
    edition: EditionMetadata
    section: SectionMetadata
    question: QuestionMetadata
    suffix?: string
    addRootNode: boolean
}) =>
    `${addRootNode ? 'dataAPI.' : ''}surveys.${survey.id}.${edition.id}.${section.id}.${
        question.id
    }${suffix}`

export const getBlockDataPath = ({
    block,
    pageContext,
    addRootNode = true,
    suffix = ''
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    addRootNode?: boolean
    suffix?: string
}) => {
    const { currentSurvey: survey, currentEdition: edition } = pageContext
    // if a different sectionId is specified in the query options, use that as
    // part of the data path
    const sectionId = block?.queryOptions?.sectionId || pageContext.id
    const section = { id: sectionId } as SectionMetadata
    const question = block as QuestionMetadata
    const dataPath =
        block.dataPath ||
        getDefaultDataPath({
            survey,
            edition,
            section,
            question,
            addRootNode,
            suffix
        })
    return dataPath
}

export const getBlockSeriesData = ({
    block,
    pageContext,
    filtersState
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    filtersState?: CustomizationDefinition
}): Array<DataSeries<any>> => {
    if (filtersState?.filters) {
        return filtersState.filters.map((filters, i) => {
            const suffix = `_${i + 1}`
            const dataPath = getBlockDataPath({ block, pageContext, suffix })
            return {
                dataPath,
                filters,
                name: block.id + suffix,
                data: get(pageContext.pageData, dataPath)
            }
        })
    } else {
        const dataPath = getBlockDataPath({ block, pageContext })
        return [{ dataPath, name: block.id, data: get(pageContext.pageData, dataPath) }]
    }
}

// simple legacy version when there is no filters and only one series
export const getBlockData = ({
    block,
    pageContext
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
}) => {
    const dataPath = getBlockDataPath({ block, pageContext })
    const data = get(pageContext.pageData, dataPath)
    return { dataPath, data }
}
