import React from 'react'
import '../common2/ChartsCommon.scss'
import './MultiItems.scss'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { MultiItemsExperienceControls } from './MultiItemsControls'
import { GroupingOptions, MultiItemsExperienceBlockProps } from './types'
import {
    combineItems,
    getColumnDimensions,
    getItemTotals,
    getMaxValues,
    sortItems,
    useChartState
} from './helpers'
import { Row } from './MultiItemsRow'
import { ColumnHeading } from './MultiItemsColumnHeading'
import { useI18n } from '@devographics/react-i18n'
import Rows from '../common2/Rows'
import { ColumnModes } from '../common2/types'
import { ChartHeading, ChartWrapper, Legend } from '../common2'
import { useTheme } from 'styled-components'

export const sortOptions = {
    experience: Object.values(FeaturesOptions),
    sentiment: Object.values(SimplifiedSentimentOptions)
}

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    const { data, block, question } = props
    const { items } = data

    const theme = useTheme()
    const chartState = useChartState()
    const { columnMode, grouping, variable, sort, order } = chartState

    const { getString } = useI18n()
    const shouldSeparateColumns = columnMode === ColumnModes.SPLIT

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

    const { columnDimensions } = getColumnDimensions({ maxValues, shouldSeparateColumns })

    const chartValues = {
        question,
        facetQuestion: {
            id: '_sentiment'
        }
    }
    const commonProps = {
        items: sortedItems,
        chartState,
        maxValues,
        chartValues,
        block
    }

    const options =
        grouping === GroupingOptions.EXPERIENCE
            ? Object.values(FeaturesOptions).map(option => ({ id: option }))
            : Object.values(SimplifiedSentimentOptions).map(option => ({ id: option }))

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
                            question={{ id: 'foo' }}
                        />

                        {/* <div
                        className={`multiexp-column-headings multiexp-column-headings-${columnMode}`}
                    >
                        <h3 className="multiexp-table-grouping">
                            {getString(`charts.group.${grouping}`)?.t}
                        </h3>
                        <div className="multiexp-column-headings-inner">
                            {columnIds.map(columnId => {
                                const columnDimension = columnDimensions.find(
                                    d => d.id === columnId
                                )
                                const { width = 0, offset = 0 } = columnDimension || {}
                                return (
                                    <ColumnHeading
                                        key={columnId}
                                        columnId={columnId}
                                        width={width}
                                        offset={offset}
                                        chartState={chartState}
                                    />
                                )
                            })}
                        </div>
                    </div> */}
                    </div>
                </ChartHeading>

                <Rows>
                    {sortedItems.map((item, i) => (
                        <Row key={item.id} item={item} {...commonProps} />
                    ))}
                </Rows>
            </>
        </ChartWrapper>
    )
}

export default MultiItemsExperienceBlock
