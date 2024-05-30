import React from 'react'
import '../common2/ChartsCommon.scss'
import './MultiItems.scss'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { MultiItemsExperienceControls } from './MultiItemsControls'
import { CellDimension, GroupingOptions, MultiItemsExperienceBlockProps } from './types'
import {
    applyRatio,
    combineItems,
    getCellDimensions,
    getItemTotals,
    getMaxValues,
    getRowOffset,
    sortBuckets,
    sortItems,
    useChartState,
    useChartValues
} from './helpers'
import { Row } from './MultiItemsRow'
import Rows from '../horizontalBar2/rows/Rows'
import { ChartWrapper, Legend, Note } from '../common2'
import { useTheme } from 'styled-components'
import min from 'lodash/min'
import max from 'lodash/max'
import take from 'lodash/take'
import { NoteContents } from './MultiItemsNote'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

const defaultLimit = 5

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    const { series, block, question } = props
    const items = series[0].data

    if (!items) {
        console.log(series)
        return <div>No data found</div>
    }

    const theme = useTheme()
    const chartState = useChartState({ rowsLimit: block?.chartOptions?.limit || defaultLimit })
    const { grouping, variable, sort, order } = chartState

    const columnIds = sortOptions[grouping]
    const allColumnIds = [
        ...Object.values(FeaturesOptions),
        ...Object.values(SimplifiedSentimentOptions)
    ]
    const className = `multiexp multiexp-groupedBy-${grouping}`

    // combine/flatten each item's buckets
    let combinedItems = combineItems({ items, variable })

    // get column-by-column grouped totals
    const groupedTotals = getItemTotals({ combinedItems, columnIds: allColumnIds })

    // get max value among all items for each column
    const maxValues = getMaxValues({ groupedTotals, columnIds })

    // sort items according to grouped totals
    combinedItems = sortItems({ combinedItems, groupedTotals, sort, order })

    const chartValues = useChartValues({ items: combinedItems, chartState, question })

    if (chartState.rowsLimit) {
        combinedItems = take(combinedItems, chartState.rowsLimit)
    }

    let allRowsCellDimensions = combinedItems.map(item =>
        getCellDimensions({
            buckets: sortBuckets(item.combinedBuckets, grouping),
            chartState
        })
    )

    let allRowsOffsets = allRowsCellDimensions.map(cd =>
        getRowOffset({
            firstRowCellDimensions: allRowsCellDimensions[0],
            cellDimensions: cd,
            chartState
        })
    )

    // offseting row will make the entire chart expand past 100%
    // shrink it down to 100% again
    // note: offsets can be positive (offset to the left) or negative (offset to the right)
    const largestNegativeOffset = min(allRowsOffsets.filter(o => o < 0)) || 0
    const largestPositiveOffset = max(allRowsOffsets.filter(o => o > 0)) || 0

    const totalWidthWithOffset = Math.abs(largestNegativeOffset) + largestPositiveOffset + 100
    const rowOffsetShrinkRatio = 100 / totalWidthWithOffset
    allRowsCellDimensions = allRowsCellDimensions.map(cd =>
        applyRatio<CellDimension>(cd, rowOffsetShrinkRatio)
    )
    // note: up to now we have only calculated offsets relative to the first row
    // but the first row may itself need to be offseted. In this case
    // subract additional largestPositiveOffset to all offsets
    allRowsOffsets = allRowsOffsets.map(rowOffset => rowOffset - largestPositiveOffset)
    // finally, apply shrinking ratio
    allRowsOffsets = allRowsOffsets.map(rowOffset => rowOffset * rowOffsetShrinkRatio)

    const commonProps = {
        items: combinedItems,
        chartState,
        maxValues,
        chartValues,
        block,
        allRowsCellDimensions,
        allRowOffsets: allRowsOffsets
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
                <div className="multiexp-chart-heading">
                    <MultiItemsExperienceControls chartState={chartState} />

                    <Legend
                        {...commonProps}
                        options={options}
                        colorScale={colorScale}
                        i18nNamespace={grouping}
                    />
                </div>

                <Rows {...commonProps}>
                    {combinedItems.map((item, i) => (
                        <Row key={item.id + i} rowIndex={i} item={item} {...commonProps} />
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
