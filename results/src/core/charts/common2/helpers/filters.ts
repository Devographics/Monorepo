import { CustomizationFiltersSeries } from 'core/filters/types'
import { CustomVariant } from 'core/filters/helpers'
import { BlockVariantDefinition } from 'core/types'

export const getItemFilters = ({
    variant,
    block,
    serieIndex
}: {
    variant?: CustomVariant
    block?: BlockVariantDefinition
    serieIndex: number
}) => {
    const filtersState = variant?.chartFilters || block?.filtersState
    if (!filtersState) {
        return
    }
    const showDefaultSeries = filtersState?.options?.showDefaultSeries || false
    const defaultFilters: CustomizationFiltersSeries = { isDefault: true, conditions: [] }
    const filters = showDefaultSeries
        ? [defaultFilters, ...filtersState.filters]
        : filtersState?.filters
    const itemFilters = filters?.[serieIndex]
    return itemFilters
}
