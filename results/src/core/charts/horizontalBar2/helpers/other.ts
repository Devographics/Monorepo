import {
    Bucket,
    FeaturesOptions,
    QuestionMetadata,
    ResponseData,
    ResultsSubFieldEnum,
    SimplifiedSentimentOptions,
    StandardQuestionData
} from '@devographics/types'
import { HorizontalBarChartState, HorizontalBarViews } from '../types'
import { DataSeries, FacetItem } from 'core/filters/types'
import { usePageContext } from 'core/helpers/pageContext'
import { applySteps } from './steps'
import { getViewDefinition } from './views'
import sortBy from 'lodash/sortBy'
import { OrderOptions } from 'core/charts/common2/types'
import { BlockVariantDefinition } from 'core/types'
import uniq from 'lodash/uniq'
import { RowSingle } from '../rows/RowSingle'
import { RowStacked } from '../rows/RowStacked'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

export const getChartCurrentEdition = ({
    serie,
    block
}: {
    serie: DataSeries<StandardQuestionData>
    block: BlockVariantDefinition
}) => {
    const subField = block?.queryOptions?.subField || ResultsSubFieldEnum.RESPONSES
    const { currentEdition } = serie.data[subField] as ResponseData
    return currentEdition
}

export const getChartBuckets = ({
    serie,
    block,
    chartState
}: {
    serie: DataSeries<StandardQuestionData>
    block: BlockVariantDefinition
    chartState: HorizontalBarChartState
}) => {
    const { view, sort, facet, order, rowsLimit } = chartState
    const { dataFilters: steps, getValue } = getViewDefinition(view)
    const currentEdition = getChartCurrentEdition({ serie, block })

    let buckets = currentEdition.buckets
    if (steps) {
        buckets = applySteps(buckets, steps)
    }
    if (sort && getValue) {
        if (facet) {
            buckets = sortBy(buckets, bucket => {
                // find the facet bucket targeted by the sort
                const relevantFacetBucket = bucket.facetBuckets.find(fb => fb.id == sort)
                if (!relevantFacetBucket) {
                    return 0
                } else {
                    const value = getValue(relevantFacetBucket)
                    return value
                }
            })
        } else {
            buckets = sortBy(buckets, bucket => {
                const value = getValue(bucket)
                return value
            })
        }
        if (order === OrderOptions.DESC) {
            buckets = buckets.toReversed()
        }
    }
    return buckets
}

export const getRowComponent = (bucket: Bucket, chartState: HorizontalBarChartState) => {
    const { view } = chartState
    const { facetBuckets } = bucket
    const hasFacetBuckets = facetBuckets && facetBuckets.length > 0
    if (hasFacetBuckets) {
        if (view === HorizontalBarViews.BOXPLOT) {
            return null
        } else if (view === HorizontalBarViews.PERCENTAGE_BUCKET) {
            return RowSingle
        } else {
            return RowStacked
        }
    } else {
        return RowSingle
    }
}

export const useQuestionMetadata = (facet?: FacetItem) => {
    if (!facet) return
    const { id, sectionId } = facet
    const allQuestions = useAllQuestionsMetadata()
    const question = allQuestions.find(q => q.id === id && q.sectionId === sectionId)
    return question
}

export const useAllQuestionsMetadata = () => {
    const context = usePageContext()
    const { currentEdition } = context
    const questions = []
    for (const section of currentEdition.sections) {
        for (const question of section.questions) {
            questions.push({ sectionId: section.id, ...question })
        }
    }
    return questions as Array<QuestionMetadata & { sectionId: string }>
}

export const getAllFacetBucketIds = ({
    series,
    block,
    chartState
}: {
    series: Array<DataSeries<StandardQuestionData>>
    block: BlockVariantDefinition
    chartState: HorizontalBarChartState
}) => {
    return uniq(
        series
            .map(serie => {
                const buckets = getChartBuckets({ serie, block, chartState })
                return buckets.map(bucket => bucket.facetBuckets.map(facetBucket => facetBucket.id))
            })
            .flat()
            .flat()
    )
}
