import isEmpty from 'lodash/isEmpty.js'
import { QueryArgs, ResponseArgumentsStrings } from './types'
import { SENTIMENT_FACET } from '@devographics/constants'
import { FacetItem, Filters } from '@devographics/types'
import { CustomizationFiltersCondition } from '../filters/types'

export const facetItemToFacet = ({ sectionId, sectionIdOverride, id }: FacetItem) =>
    id === SENTIMENT_FACET ? SENTIMENT_FACET : `${sectionIdOverride || sectionId}__${id}`

export const getQueryArgsString = ({
    facet,
    filters,
    parameters,
    bucketsFilter,
    xAxis,
    yAxis
}: QueryArgs): string | undefined => {
    const args: ResponseArgumentsStrings = {}
    if (facet) {
        args.facet = facetItemToFacet(facet)
    }
    if (filters && !isEmpty(filters)) {
        args.filters = unquote(JSON.stringify(filters))
    }
    if (parameters && !isEmpty(parameters)) {
        args.parameters = unquote(JSON.stringify(parameters))
    }
    if (bucketsFilter && !isEmpty(bucketsFilter)) {
        args.bucketsFilter = unquote(JSON.stringify(bucketsFilter))
    }
    // for data explorer
    if (yAxis && !isEmpty(yAxis)) {
        args.axis1 = yAxis
    }
    if (xAxis && !isEmpty(xAxis)) {
        args.axis2 = xAxis
    }
    if (isEmpty(args)) {
        return ''
    } else {
        return wrapArguments(args)
    }
}

// v1: {"foo": "bar"} => {foo: "bar"}
// const unquote = s => s.replace(/"([^"]+)":/g, '$1:')

// v2: {"foo": "bar"} => {foo: bar} (for enums)
const unquote = (s: string) => s.replaceAll('"', '')

const unquoteValuesOnly = (s: string) => s.replace(/"([^"]+)":/g, '$1:')

const wrapArguments = (args: ResponseArgumentsStrings) => {
    const keys = Object.keys(args)

    return keys.length > 0
        ? `(${keys
              .filter(k => !!args[k as keyof ResponseArgumentsStrings])
              .map(k => `${k}: ${args[k as keyof ResponseArgumentsStrings]}`)
              .join(', ')})`
        : ''
}

export const conditionsToFilters = (conditions: CustomizationFiltersCondition[]) => {
    const filters: Filters = {}
    conditions.forEach(condition => {
        const { sectionId, fieldId, operator, value } = condition
        filters[`${sectionId}__${fieldId}`] = { [operator]: value }
    })
    return filters
}
