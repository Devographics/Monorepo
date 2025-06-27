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
    const { axis1, axis2: axis2_, filters, bucketsFilter, options = {} } = chartFilters || {}
    let axis2 = axis2_
    // backwards compatibility with YAML configs
    if (chartFilters?.facet) {
        axis2 = chartFilters?.facet
    }
    const { showDefaultSeries } = options
    const questionId = axis1?.id || block.fieldId || block.id
    const queryOptions = {
        ...block.queryOptions,
        surveyId: survey?.id,
        editionId: edition?.id,
        sectionId: axis1?.sectionId || block.queryOptions?.sectionId || section?.id,
        questionId,
        subField: ResultsSubFieldEnum.COMBINED,
        // we never need comments when querying from the client
        addQuestionComments: false
    }
    let parameters = block.parameters || {}

    if (options && !isEmpty(options)) {
        parameters = { ...parameters, ...getParameters(options) }
    }

    const defaultQueryArgs = {
        facet: axis2,
        parameters,
        bucketsFilter
    }
    const hasFilters = filters && filters.length > 0
    // ? do we need custom seriesName here?
    // const seriesName = facet ? `${questionId}_by_${facet.id}` : `${questionId}`
    const seriesName = axis1?.id || block.id
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
    const query = getDefaultQueryFragment({ queryOptions, series })

    const blockQuery = {
        query,
        seriesNames: series.map(s => s.name)
    }

    return blockQuery
}
