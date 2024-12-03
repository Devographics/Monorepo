import React from 'react'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
import { getItemFilters } from '../common2/helpers/filters'
import { MultiRatioSerie, MultiRatiosChartState } from './types'
import { useChartValues } from './helpers/chartValues'
import { multiRatiosViewDefinition } from './View'

export const RatiosSerie = (
    props: {
        legendItems: LegendItem[]
        serie: MultiRatioSerie
        serieIndex: number
    } & CommonProps<MultiRatiosChartState>
) => {
    const { serie, serieIndex, block, chartState, variant, question, legendItems } = props
    const viewDefinition = multiRatiosViewDefinition
    const { getLineItems } = viewDefinition
    const lineItems = getLineItems({ serie, question, chartState })

    const chartValues = useChartValues({ lineItems, chartState, block, question, legendItems })

    const viewProps = { block, lineItems, chartState, chartValues }

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const ViewComponent = multiRatiosViewDefinition.component

    return (
        <GridItem<MultiRatioSerie>
            key={serie.name}
            filters={itemFilters}
            serie={serie}
            block={block}
        >
            <ViewComponent {...viewProps} />
        </GridItem>
    )
}

export default RatiosSerie
