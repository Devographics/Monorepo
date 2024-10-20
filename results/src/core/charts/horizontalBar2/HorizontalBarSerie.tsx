import React from 'react'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getChartBuckets } from './helpers/other'
import { useChartValues } from './helpers/chartValues'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
import take from 'lodash/take'
import { getViewComponent } from './helpers/views'
import { getItemFilters } from '../common2/helpers/filters'
import { HorizontalBarChartState, HorizontalBarViewProps, HorizontalBarViews } from './types'
import { applyRowsLimit } from '../multiItemsExperience/helpers'

export const HorizontalBarSerie = (
    props: {
        serie: DataSeries<StandardQuestionData>
        serieIndex: number
        isReversed?: boolean
    } & CommonProps<HorizontalBarChartState>
) => {
    const {
        seriesMetadata,
        serie,
        serieIndex,
        block,
        chartState,
        variant,
        question,
        isReversed = false
    } = props
    const { rowsLimit } = chartState

    let buckets = getChartBuckets({ serie, block, chartState })
    const chartValues = useChartValues({ seriesMetadata, buckets, chartState, question })

    if (applyRowsLimit(rowsLimit, chartValues.totalRows)) {
        buckets = take(buckets, chartState.rowsLimit)
    }

    // let allRowOffsets = allRowsCellDimensions.map(cd =>
    //     getRowOffset({
    //         firstRowCellDimensions: allRowsCellDimensions[0],
    //         cellDimensions: cd,
    //         chartState
    //     })
    // )

    const viewProps: HorizontalBarViewProps = {
        ...props,
        isReversed,
        buckets,
        chartValues
    }

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const ViewComponent = getViewComponent(chartState.view as HorizontalBarViews)

    return (
        <GridItem key={serie.name} filters={itemFilters}>
            <ViewComponent {...viewProps} />
        </GridItem>
    )
}
