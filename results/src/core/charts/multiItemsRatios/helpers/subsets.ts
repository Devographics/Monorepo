import { EditionWithRankAndPointData } from '../types'
import { BasicPointData, LineItem } from '../../verticalBar2/types'
import sortBy from 'lodash/sortBy'
import { SectionMetadata } from '@devographics/types'
import intersection from 'lodash/intersection'

const ITEMS_TO_KEEP = 10

const getItemsSortedByValue = (items: LineItem<EditionWithRankAndPointData>[]) => {
    // only consider items with points
    const itemsWithPoints = items.filter(item => item.points.length > 0)
    return sortBy(itemsWithPoints, item => item?.points?.at(-1)?.value)
}
export const getTopItems = (items: LineItem<EditionWithRankAndPointData>[]) => {
    return getItemsSortedByValue(items).toReversed().slice(0, ITEMS_TO_KEEP)
}
const getBottomItems = (items: LineItem<EditionWithRankAndPointData>[]) => {
    const sortedItems = getItemsSortedByValue(items).slice(0, ITEMS_TO_KEEP)
    // we always return items sorted by current year value descending
    // to help sort legend in a way that visually matches the chart
    return sortedItems.toReversed()
}

const getItemsSortedByDelta = (items: LineItem<EditionWithRankAndPointData>[]) => {
    const itemsWithAtLeastTwoPoints = items.filter(item => item.points.length > 1)
    return sortBy(
        itemsWithAtLeastTwoPoints,
        item => (item?.points?.at(-1)?.value || 0) - (item?.points?.at(-2)?.value || 0)
    )
}
const getLargestIncrease = (items: LineItem<EditionWithRankAndPointData>[]) => {
    const sortedItems = getItemsSortedByDelta(items).toReversed().slice(0, ITEMS_TO_KEEP)
    // we always return items sorted by current year value descending
    // to help sort legend in a way that visually matches the chart
    return getItemsSortedByValue(sortedItems).toReversed()
}
const getLargestDecrease = (items: LineItem<EditionWithRankAndPointData>[]) => {
    const sortedItems = getItemsSortedByDelta(items).slice(0, ITEMS_TO_KEEP)
    // we always return items sorted by current year value descending
    // to help sort legend in a way that visually matches the chart
    return getItemsSortedByValue(sortedItems).toReversed()
}

export enum SubsetPresets {
    TOP_ITEMS = 'top_items',
    BOTTOM_ITEMS = 'bottom_items',
    LARGEST_INCREASE = 'largest_increase',
    LARGEST_DECREASE = 'largest_decrease'
}

export const subsetFunctions = {
    [SubsetPresets.TOP_ITEMS]: getTopItems,
    [SubsetPresets.BOTTOM_ITEMS]: getBottomItems,
    [SubsetPresets.LARGEST_INCREASE]: getLargestIncrease,
    [SubsetPresets.LARGEST_DECREASE]: getLargestDecrease
}

export const getSubsetIds = ({
    subset,
    lineItems,
    sections
}: {
    subset: string | number | null
    lineItems: LineItem<BasicPointData>[]
    sections: SectionMetadata[]
}) => {
    if (!subset) {
        return lineItems
    } else {
        const subsetSection = sections.find(section => section.id === subset)
        const subsetFunction = subsetFunctions[subset]
        if (subsetSection) {
            // sort by current year value, descending
            const allSortedItems = getItemsSortedByValue(lineItems).toReversed()
            const sectionItems = intersection(
                allSortedItems.map(item => item.id),
                subsetSection.questions.map(q => q.id)
            )
            return sectionItems
        } else if (subsetFunction) {
            return subsetFunction(lineItems).map(item => item.id)
        } else {
            return lineItems
        }
    }
}
