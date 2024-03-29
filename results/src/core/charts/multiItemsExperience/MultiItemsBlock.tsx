import React from 'react'
import '../common2/ChartsCommon.scss'
import './MultiItems.scss'
import { FeaturesOptions, Option, SimplifiedSentimentOptions } from '@devographics/types'
import { MultiItemsExperienceControls } from './MultiItemsControls'
import { GroupingOptions, MultiItemsExperienceBlockProps } from './types'
import {
    applyRatio,
    combineItems,
    getCellDimensions,
    getItemTotals,
    getMaxValues,
    getRowOffset,
    sortBuckets,
    sortItems,
    useChartState
} from './helpers'
import { Row } from './MultiItemsRow'
import Rows from '../common2/Rows'
import { ChartHeading, ChartWrapper, Legend, Note } from '../common2'
import { useTheme } from 'styled-components'
import min from 'lodash/min'
import max from 'lodash/max'
import { NoteContents } from './MultiItemsNote'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    const { data, block, question } = props
    const { items } = data

    const theme = useTheme()
    const chartState = useChartState()
    const { grouping, variable, sort, order } = chartState

    const columnIds = sortOptions[grouping]
    const allColumnIds = [
        ...Object.values(FeaturesOptions),
        ...Object.values(SimplifiedSentimentOptions)
    ]

    const className = `multiexp multiexp-groupedBy-${grouping}`

    // combine/flatten each item's buckets
    const combinedItems = combineItems({ items, variable })

    // get column-by-column grouped totals
    const groupedTotals = getItemTotals({ combinedItems, columnIds: allColumnIds })

    // get max value among all items for each column
    const maxValues = getMaxValues({ groupedTotals, columnIds })

    // sort items according to grouped totals
    const sortedItems = sortItems({ combinedItems, groupedTotals, sort, order })

    const chartValues = {
        question,
        facetQuestion: {
            id: '_sentiment'
        }
    }

    let allRowsCellDimensions = sortedItems.map(item =>
        getCellDimensions({
            buckets: sortBuckets(item.combinedBuckets, grouping),
            chartState
        })
    )

    let allRowOffsets = allRowsCellDimensions.map(cd =>
        getRowOffset({
            firstRowCellDimensions: allRowsCellDimensions[0],
            cellDimensions: cd,
            chartState
        })
    )

    // offseting row will make the entire chart expand past 100%
    // shrink it down to 100% again
    // note: offsets can be positive (offset to the left) or negative (offset to the right)
    const largestNegativeOffset = min(allRowOffsets.filter(o => o < 0)) || 0
    const largestPositiveOffset = max(allRowOffsets.filter(o => o > 0)) || 0

    const totalWidthWithOffset = Math.abs(largestNegativeOffset) + largestPositiveOffset + 100
    const rowOffsetShrinkRatio = 100 / totalWidthWithOffset
    allRowsCellDimensions = allRowsCellDimensions.map(cd => applyRatio(cd, rowOffsetShrinkRatio))
    // note: up to now we have only calculated offsets relative to the first row
    // but the first row may itself need to be offseted. In this case
    // subract additional largestPositiveOffset to all offsets
    allRowOffsets = allRowOffsets.map(rowOffset => rowOffset - largestPositiveOffset)
    // finally, apply shrinking ratio
    allRowOffsets = allRowOffsets.map(rowOffset => rowOffset * rowOffsetShrinkRatio)

    const commonProps = {
        items: sortedItems,
        chartState,
        maxValues,
        chartValues,
        block,
        allRowsCellDimensions,
        allRowOffsets
    }

    const options =
        grouping === GroupingOptions.EXPERIENCE
            ? Object.values(FeaturesOptions).map(option => ({ id: option }))
            : Object.values(SimplifiedSentimentOptions)
                  .filter(o => o !== SimplifiedSentimentOptions.NEUTRAL_SENTIMENT)
                  .map(option => ({ id: option }))

    const colorScale =
        grouping === GroupingOptions.EXPERIENCE
            ? theme.colors.ranges.features
            : theme.colors.ranges.sentiment

    return (
        <ChartWrapper className={className}>
            <>
                <ChartHeading>
                    <div className="multiexp-chart-heading">
                        <MultiItemsExperienceControls chartState={chartState} />

                        <Legend
                            {...commonProps}
                            options={options}
                            colorScale={colorScale}
                            i18nNamespace={grouping}
                        />
                    </div>
                </ChartHeading>

                <Rows>
                    {sortedItems.map((item, i) => (
                        <Row key={item.id} rowIndex={i} item={item} {...commonProps} />
                    ))}
                </Rows>

                <Note>
                    <NoteContents />
                </Note>
            </>
        </ChartWrapper>
    )
}

export default MultiItemsExperienceBlock
