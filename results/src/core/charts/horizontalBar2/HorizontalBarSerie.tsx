import React from 'react'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getChartBuckets } from './helpers/other'
import { useChartValues } from './helpers/chartValues'
import View from '../common2/View'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
import take from 'lodash/take'
import { getCellDimensions } from './helpers/dimensions'
import { getViewDefinition } from './helpers/views'

export const HorizontalBarSerie = (
    props: {
        serie: DataSeries<StandardQuestionData>
        serieIndex: number
    } & CommonProps
) => {
    const { serie, serieIndex, block, chartState, variant, question } = props
    const { rowsLimit } = chartState
    let buckets = getChartBuckets({ serie, block, chartState })
    const chartValues = useChartValues({ buckets, chartState, block, question })

    if (rowsLimit) {
        buckets = take(buckets, chartState.rowsLimit)
    }

    // let allRowOffsets = allRowsCellDimensions.map(cd =>
    //     getRowOffset({
    //         firstRowCellDimensions: allRowsCellDimensions[0],
    //         cellDimensions: cd,
    //         chartState
    //     })
    // )

    const viewProps = {
        ...props,
        buckets,
        chartValues
    }

    const itemFilters =
        variant?.chartFilters?.filters?.[serieIndex] || block?.filtersState?.filters?.[serieIndex]
    return (
        <GridItem key={serie.name} filters={itemFilters}>
            <View {...viewProps} />
        </GridItem>
    )
}
