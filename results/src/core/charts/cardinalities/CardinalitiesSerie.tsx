import React from 'react'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getSerieMetadata, getSerieMetadataProps } from '../horizontalBar2/helpers/other'
import { useChartValues } from '../horizontalBar2/helpers/chartValues'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
import { getItemFilters } from '../common2/helpers/filters'
import { HorizontalBarViewProps } from '../horizontalBar2/types'
import { getSerieBuckets } from './helpers/other'
import { getViewComponent, getViewDefinition } from './helpers/views'
import { CardinalitiesChartState } from './types'

export const CardinalitiesSerie = (
    props: {
        serie: DataSeries<StandardQuestionData>
        serieIndex: number
        isReversed?: boolean
    } & CommonProps<CardinalitiesChartState>
) => {
    const {
        seriesMetadata,
        serie,
        serieIndex,
        block,
        chartState,
        variant,
        question,
        isReversed = false,
        viewDefinition
    } = props

    const { currentEdition } = serie.data.find(data => data.id === chartState.view).responses

    const buckets = getSerieBuckets({ serie, block, chartState })

    const serieMetadata = getSerieMetadata({ serie, block })

    const serieMetadataProps = getSerieMetadataProps({ currentEdition })

    const chartValues = useChartValues({
        seriesMetadata,
        buckets,
        chartState,
        question,
        viewDefinition,
        serieMetadataProps
    })

    const viewProps: HorizontalBarViewProps = {
        ...props,
        isReversed,
        buckets,
        chartValues,
        serieMetadata,
        // TODO: find better naming
        serieMetadataProps,
        viewDefinition
    }

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const ViewComponent = getViewComponent(chartState.view)

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
