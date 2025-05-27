import React from 'react'
import { sortProperties, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import {
    getChartBuckets,
    getChartCurrentEdition,
    getSerieMetadata,
    getSerieMetadataProps
} from './helpers/other'
import { useChartValues } from './helpers/chartValues'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
import take from 'lodash/take'
import { getViewComponent, getViewDefinition } from './helpers/views'
import { getItemFilters } from '../common2/helpers/filters'
import { HorizontalBarChartState, HorizontalBarViewProps, HorizontalBarViews } from './types'
import { applyRowsLimit } from '../multiItemsExperience/helpers/helpers'

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

    const viewDefinition = getViewDefinition(chartState.view)

    const serieMetadata = getSerieMetadata({ serie, block })

    const currentEdition = getChartCurrentEdition({ serie, block })

    const serieMetadataProps = getSerieMetadataProps({ currentEdition })

    const chartValues = useChartValues({
        seriesMetadata,
        serieMetadata,
        serieMetadataProps,
        buckets,
        chartState,
        question,
        viewDefinition
    })
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
        chartValues,
        // metadata about the API response
        serieMetadata,
        // metadata about completion, average, etc.
        // TODO: find better naming
        serieMetadataProps,
        viewDefinition
    }

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const ViewComponent = getViewComponent(chartState.view as HorizontalBarViews)

    const currentSort = serieMetadata?.axis1Sort?.property
    return (
        <GridItem<DataSeries<StandardQuestionData>>
            key={serie.name}
            filters={itemFilters}
            currentSort={currentSort}
            serie={serie}
            block={block}
        >
            <ViewComponent {...viewProps} />
        </GridItem>
    )
}
