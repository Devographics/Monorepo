import { BlockVariantDefinition } from './imports'
import { ResponsesParameters, ResultsSubFieldEnum } from './imports'
import isEmpty from 'lodash/isEmpty'
import { CustomizationDefinition, CustomizationOptions } from './imports'
import { conditionsToFilters } from './imports'
import { SeriesParams } from './types'
import { getDefaultQueryFragment } from './fragments/getDefaultQueryFragment'
import { SurveyMetadata, EditionMetadata, SectionMetadata } from './imports'

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
    section: SectionMetadata
}) => {
    const { axis1, axis2: axis2_, facet, filters, bucketsFilter, options = {} } = chartFilters || {}
    let axis2 = axis2_
    // backwards compatibility with YAML configs
    if (chartFilters?.facet) {
        axis2 = chartFilters?.facet
    }

    const { showDefaultSeries } = options
    const questionId = axis1?.id || block.fieldId || block.id

    const queryOptions = {
        surveyId: survey?.id,
        editionId: edition?.id,
        sectionId: axis1?.sectionId || section?.id,
        questionId,
        subField: ResultsSubFieldEnum.COMBINED,
        ...block.queryOptions
    }

    let parameters = block.parameters || {}

    if (options && !isEmpty(options)) {
        parameters = { ...parameters, ...getParameters(options) }
    }

    const defaultQueryArgs = {
        facet,
        bucketsFilter,
        parameters
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
