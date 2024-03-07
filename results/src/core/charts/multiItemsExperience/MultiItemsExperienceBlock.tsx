import React, { useState } from 'react'
import './MultiItemsExperience.scss'
import { FeaturesOptions } from '@devographics/types'
import sortBy from 'lodash/sortBy'
import sumBy from 'lodash/sumBy'
import compact from 'lodash/compact'
import { MultiItemsExperienceControls } from './MultiItemsExperienceControls'
import {
    ChartState,
    CombinedItem,
    DEFAULT_VARIABLE,
    GroupingOptions,
    MaxValue,
    MultiItemsExperienceBlockProps,
    OrderOptions,
    sortOptions
} from './types'
import { combineBuckets, getBuckets, getGroupedTotals } from './helpers'
import { Row } from './MultiItemsExperienceRow'
import max from 'lodash/max'

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    const { data } = props
    const { items } = data
    const [grouping, setGrouping] = useState<ChartState['grouping']>(GroupingOptions.EXPERIENCE)
    const [sort, setSort] = useState<ChartState['sort']>(FeaturesOptions.USED)
    const [order, setOrder] = useState<ChartState['order']>(OrderOptions.DESC)
    const [variable, setVariable] = useState<ChartState['variable']>(DEFAULT_VARIABLE)

    const chartState = {
        grouping,
        setGrouping,
        sort,
        setSort,
        order,
        setOrder,
        variable,
        setVariable
    }

    const className = `multiexp multiexp-groupedBy-${grouping}`

    let sortedItems = sortBy(items, item => {
        const buckets = item.responses.currentEdition.buckets
        if (grouping === GroupingOptions.EXPERIENCE) {
            const sortingBucket = buckets.find(bucket => bucket.id === sort)
            return sortingBucket?.percentageQuestion
        } else {
            const activeSentimentBuckets = compact(
                buckets.map(bucket => bucket.facetBuckets.find(fb => fb.id === sort)).flat()
            )
            const sentimentTotalPercentage = sumBy(
                activeSentimentBuckets,
                fb => fb.percentageQuestion || 0
            )
            return sentimentTotalPercentage
        }
    })

    if (order === OrderOptions.DESC) {
        sortedItems = sortedItems.toReversed()
    }
    const columnIds = sortOptions[grouping]

    const groupedTotals = sortedItems.map(item =>
        getGroupedTotals({ item, bucketIds: columnIds, variable, grouping })
    )

    const maxValues: MaxValue[] = columnIds.map(columnId => {
        const columnMax = max(groupedTotals.map(total => total[columnId]))
        return { id: columnId, maxValue: columnMax || 0 }
    })

    const combinedItems: CombinedItem[] = sortedItems.map(item => ({
        id: item.id,
        entity: item.entity,
        combinedBuckets: combineBuckets(getBuckets(item))
    }))

    return (
        <div className={className}>
            <MultiItemsExperienceControls chartState={chartState} />
            <div className="multiexp-rows">
                {combinedItems.map(item => (
                    <Row
                        key={item.id}
                        item={item}
                        groupedTotals={groupedTotals}
                        maxValues={maxValues}
                        chartState={chartState}
                    />
                ))}
            </div>
        </div>
    )
}

export default MultiItemsExperienceBlock
