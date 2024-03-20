import {
    Bucket,
    FacetBucket,
    FeaturesOptions,
    ResponseData,
    ResultsSubFieldEnum,
    SimplifiedSentimentOptions
} from '@devographics/types'
import { ChartState, Step, Views } from '../types'
import { HorizontalBarBlock2Props } from '../HorizontalBarBlock'
import { BoxPlotRow, FacetRow, SingleBarRow } from '../HorizontalBarRow'
import { FacetItem } from 'core/filters/types'
import { usePageContext } from 'core/helpers/pageContext'
import { applySteps } from './steps'

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
    steps = []
}: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'> & { steps: Step[] }) => {
    const currentEdition = getChartCurrentEdition({ data, series, block })
    return applySteps(currentEdition.buckets, steps)
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
