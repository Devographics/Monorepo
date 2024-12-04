import React from 'react'
import { GridItem } from '../common2'
import { CommonProps, LegendItem } from '../common2/types'
import { getItemFilters } from '../common2/helpers/filters'
import { MultiRatioSerie, MultiRatiosChartState } from './types'
import { getViewComponent } from './View'

export const RatiosSerie = (
    props: {
        legendItems: LegendItem[]
        serie: MultiRatioSerie
        serieIndex: number
    } & CommonProps<MultiRatiosChartState>
) => {
    const { serie, serieIndex, block, chartState, variant } = props

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const ViewComponent = getViewComponent(chartState.view)

    return (
        <GridItem<MultiRatioSerie>
            key={serie.name}
            filters={itemFilters}
            serie={serie}
            block={block}
        >
            <ViewComponent {...props} />
        </GridItem>
    )
}

export default RatiosSerie
