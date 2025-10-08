import {
    Bucket,
    FacetBucket,
    FeaturesOptions,
    QuestionMetadata,
    ResponseData,
    ResponseEditionData,
    ResultsSubFieldEnum,
    SimplifiedSentimentOptions,
    StandardQuestionData,
    YearCompletion
} from '@devographics/types'
import { HorizontalBarChartState, HorizontalBarViewDefinition, HorizontalBarViews } from '../types'
import { DataSeries, FacetItem } from 'core/filters/types'
import { usePageContext } from 'core/helpers/pageContext'
import { applySteps } from './steps'
import sortBy from 'lodash/sortBy'
import {
    CommonProps,
    OrderOptions,
    SerieMetadataProps,
    SeriesMetadata
} from 'core/charts/common2/types'
import { BlockVariantDefinition } from 'core/types'
import uniq from 'lodash/uniq'
import { allDataFilters } from '../helpers/steps'
import max from 'lodash/max'
import compact from 'lodash/compact'
import { getSubfieldObject } from 'core/charts/verticalBar2/helpers/other'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

export const getChartCurrentEdition = ({ serie }: { serie: DataSeries<StandardQuestionData> }) => {
    const subFieldObject = getSubfieldObject(serie)
    return subFieldObject?.allEditions?.at(-1) || subFieldObject?.currentEdition
}

export const getChartPreviousEdition = ({ serie }: { serie: DataSeries<StandardQuestionData> }) => {
    const subFieldObject = getSubfieldObject(serie)
    return subFieldObject?.allEditions?.at(-2)
}

const getDataFilters = (dataFilters: string[]) =>
    dataFilters.map(filterName => allDataFilters[filterName])

export const getChartBuckets = ({
    serie,
    block,
    chartState,
    usePreviousEdition = false
}: {
    serie: DataSeries<StandardQuestionData>
    block: BlockVariantDefinition
    chartState: HorizontalBarChartState
    usePreviousEdition?: boolean
}) => {
    const { view, sort, facet, order, rowsLimit } = chartState
    const { viewDefinition } = chartState
    const { dataFilters: viewDataFilters, getValue } = viewDefinition
    const edition = usePreviousEdition
        ? getChartPreviousEdition({ serie })
        : getChartCurrentEdition({ serie })

    let buckets = edition.buckets

    const { chartOptions = {} } = block
    const { dataFilters: blockDataFilters } = chartOptions
    const dataFilters = (blockDataFilters && getDataFilters(blockDataFilters)) || viewDataFilters
    if (dataFilters) {
        buckets = applySteps(buckets, dataFilters)
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

export const useQuestionMetadata = (facet?: FacetItem) => {
    if (!facet) return
    const { id, sectionId } = facet
    const allQuestions = useAllQuestionsMetadata()
    // note: we do not look up question metadata based on sectionId here
    // because sectionId can be wrong when question has changed sections
    const question = allQuestions.find(q => q.id === id)
    return { ...question, sectionIdOverride: sectionId }
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

export const getBlockAllFacetBucketIds = ({
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
                return getBucketsAllFacetBucketIds(buckets)
            })
            .flat()
            .flat()
    )
}

const findValidIds = (buckets: Bucket[] | FacetBucket[]) =>
    buckets.filter(b => b.count && b.count > 0).map(b => b.id)

export const getBucketsAllFacetBucketIds = (buckets: Bucket[]) => {
    const allFacetBucketIds = compact(
        uniq(buckets.map(b => b.facetBuckets && findValidIds(b.facetBuckets)).flat())
    )
    return allFacetBucketIds
}

export const getMaxValue = ({ values, view }: { values: number[]; view: HorizontalBarViews }) => {
    return [HorizontalBarViews.PERCENTAGE_BUCKET].includes(view) ? 100 : max(values) || 0
}

/*

Calculate metadata about all series (in the cases where we're showing multiple)

(note: just max value between all series for now)

*/
export const getSeriesMetadata = ({
    series,
    block,
    chartState,
    viewDefinition,
    currentEdition
}: {
    series: CommonProps<HorizontalBarChartState>['series']
    block: BlockVariantDefinition
    chartState: HorizontalBarChartState
    viewDefinition: HorizontalBarViewDefinition<HorizontalBarChartState>
    currentEdition: ResponseEditionData
}) => {
    const { completion } = currentEdition

    const { getValue } = viewDefinition
    const allSeriesValues = series
        .map(serie => {
            const buckets = getChartBuckets({ serie, block, chartState })
            const values = buckets.map(getValue)
            return values
        })
        .flat()
    const seriesMaxValue = max(allSeriesValues) || 0
    const seriesMaxBucketCount = Math.max(
        ...series
            .map(serie => {
                const buckets = getChartBuckets({ serie, block, chartState })
                return buckets.length
            })
            .flat()
    )
    const metadata: SeriesMetadata = {
        seriesMaxBucketCount,
        seriesMaxValue,
        totalRespondents: completion.count,
        totalResponses: completion.answersCount
    }
    return metadata
}

/*

Get metadata for single serie

*/
export const getSerieMetadata = ({
    serie,
    block
}: {
    serie: DataSeries<any>
    block: BlockVariantDefinition
}) => {
    const currentEdition = getChartCurrentEdition({ serie, block })
    const metadata = currentEdition?._metadata
    return metadata
}

export const getSerieMetadataProps = ({
    currentEdition
}: {
    currentEdition: ResponseEditionData
}): SerieMetadataProps => {
    const { average, percentiles, completion } = currentEdition
    return {
        average,
        median: percentiles?.p50,
        completion
    }
}
