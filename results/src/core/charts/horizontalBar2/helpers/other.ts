import {
    Bucket,
    FacetBucket,
    FeaturesOptions,
    ResponseData,
    ResultsSubFieldEnum,
    SimplifiedSentimentOptions
} from '@devographics/types'
import { ChartState, GetValueType, Step, Views } from '../types'
import { HorizontalBarBlock2Props } from '../HorizontalBarBlock'
import { BoxPlotRow, FacetRow, SingleBarRow } from '../HorizontalBarRow'
import { FacetItem } from 'core/filters/types'
import { usePageContext } from 'core/helpers/pageContext'
import { applySteps } from './steps'
import { getViewDefinition } from './views'
import sortBy from 'lodash/sortBy'
import take from 'lodash/take'
import sumBy from 'lodash/sumBy'
import { OrderOptions } from 'core/charts/common2/types'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

export const getChartCurrentEdition = ({
    data,
    series,
    block
}: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'>) => {
    const subField = block?.queryOptions?.subField || ResultsSubFieldEnum.RESPONSES
    // TODO: ideally blocks should always receive either a single series, or an array of series
    const defaultSeries = data || series[0].data
    const { currentEdition } = defaultSeries[subField] as ResponseData
    return currentEdition
}

export const getChartCompletion = ({
    data,
    series,
    block
}: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'>) => {
    const currentEdition = getChartCurrentEdition({ data, series, block })
    return currentEdition.completion
}
export const getChartBuckets = ({
    data,
    series,
    block,
    chartState
}: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'> & { chartState: ChartState }) => {
    const { view, sort, facet, order } = chartState
    const { steps, getValue } = getViewDefinition(view)
    const currentEdition = getChartCurrentEdition({ data, series, block })

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

export const getRowComponent = (bucket: Bucket, chartState: ChartState) => {
    const { view } = chartState
    const { facetBuckets } = bucket
    const hasFacetBuckets = facetBuckets && facetBuckets.length > 0
    if (hasFacetBuckets) {
        if (view === Views.BOXPLOT) {
            return BoxPlotRow
        } else if (view === Views.PERCENTAGE_BUCKET) {
            return FacetRow
        } else {
            return SingleBarRow
        }
    } else {
        return SingleBarRow
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
    return questions
}

/*

Calculate how much to offset a row by to line up whichever column/cell the chart is sorted by

*/
export const getRowOffset = ({
    buckets,
    bucket,
    chartState
}: {
    buckets: Bucket[]
    bucket: Bucket
    chartState: ChartState
}) => {
    const { view, sort } = chartState
    const { getValue } = getViewDefinition(view)

    if (getValue && [Views.PERCENTAGE_BUCKET, Views.FACET_COUNTS].includes(view) && sort) {
        const getOffset = (bucket: Bucket) => {
            const { facetBuckets } = bucket
            const currentFacetBucketIndex = facetBuckets.findIndex(fb => fb.id === sort)
            const previousFacetBuckets = take(facetBuckets, currentFacetBucketIndex)
            const valuesSum = sumBy(previousFacetBuckets, fb => getValue(fb))
            return valuesSum
        }

        const firstBucketOffset = getOffset(buckets[0])
        const currentBucketOffset = getOffset(bucket)
        return currentBucketOffset - firstBucketOffset
    } else {
        return 0
    }
}
