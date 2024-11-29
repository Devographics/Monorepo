import { BlockVariantDefinition } from 'core/types'
import {
    EditionMetadata,
    ResponsesParameters,
    ResultsSubFieldEnum,
    SectionMetadata,
    SurveyMetadata
} from '@devographics/types'
import { PageContextValue } from 'core/types/context'
import isEmpty from 'lodash/isEmpty'
import { CustomizationDefinition, CustomizationOptions } from 'core/filters/types'
import { conditionsToFilters } from 'core/filters/helpers'
import { SeriesParams } from './types'
import { getDefaultQueryFragment } from './fragments/getDefaultQueryFragment'

export const getParameters = (options: CustomizationOptions) => {
    const parameters: ResponsesParameters = {}
    const { cutoff, cutoffType, limit, mergeOtherBuckets } = options
    if (options.cutoff) {
        if (cutoffType === 'percent') {
            // use same cutoff value for both
            parameters.cutoffPercent = cutoff
            parameters.facetCutoffPercent = cutoff
        } else {
            parameters.cutoff = cutoff
            parameters.facetCutoff = cutoff
        }
    }
    if (limit) {
        parameters.limit = limit
    }
    if (mergeOtherBuckets) {
        parameters.mergeOtherBuckets = mergeOtherBuckets
    }
    return parameters
}
/*

For a given block and pageContext, generate query and query options and return result

*/
export const getBlockQuery = ({
    block,
    survey,
    edition,
    section,
    chartFilters
}: {
    chartFilters?: CustomizationDefinition
    block: BlockVariantDefinition
    survey: SurveyMetadata
    edition: EditionMetadata
    section: { id: SectionMetadata['id'] }
}) => {
    const { facet, filters, bucketsFilter, options = {} } = chartFilters || {}
    const { showDefaultSeries } = options
    const questionId = block.fieldId || block.id
    const queryOptions = {
        surveyId: survey?.id,
        editionId: edition?.id,
        sectionId: section?.id,
        questionId,
        subField: block?.queryOptions?.subField || ResultsSubFieldEnum.RESPONSES,
        ...block.queryOptions
    }
    let parameters = block.parameters || {}

    if (options && !isEmpty(options)) {
        parameters = { ...parameters, ...getParameters(options) }
    }

    const defaultQueryArgs = {
        facet,
        parameters,
        bucketsFilter
    }
    const hasFilters = filters && filters.length > 0
    // ? do we need custom seriesName here?
    // const seriesName = facet ? `${questionId}_by_${facet.id}` : `${questionId}`
    const seriesName = block.id
    const defaultSeriesName = hasFilters ? `${seriesName}_default` : seriesName

    const defaultSeries = { name: defaultSeriesName, queryArgs: defaultQueryArgs }
    let series: SeriesParams[]
    if (hasFilters) {
        series = [
            ...(showDefaultSeries ? [defaultSeries] : []),
            ...filters.map((filter, filterIndex) => {
                const { conditions } = filter
                const filters = conditionsToFilters(conditions)
                const name = `${seriesName}_${filterIndex + 1}`
                return { name, queryArgs: { ...defaultQueryArgs, filters } }
            })
        ]
    } else {
        series = [defaultSeries]
    }
    return {
        query: getDefaultQueryFragment({ queryOptions, series }),
        seriesNames: series.map(s => s.name)
    }
}
