import React from 'react'
import { DataSeries } from 'core/filters/types'
import { GridItem } from '../common2'
import { ChartStateWithView, CommonProps } from '../common2/types'
import { getViewComponent } from './helpers/views'
import { getItemFilters } from '../common2/helpers/filters'

export const VerticalBarSerie = <SerieData, ChartStateType extends ChartStateWithView>(
    props: {
        serie: DataSeries<SerieData>
        serieIndex: number
    } & CommonProps<ChartStateType>
) => {
    const { serie, serieIndex, block, chartState, viewDefinition, variant } = props

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const ViewComponent = viewDefinition.component

    return (
        <GridItem<DataSeries<SerieData>>
            key={serie.name}
            filters={itemFilters}
            serie={serie}
            block={block}
        >
            <ViewComponent {...props} />

            {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}
        </GridItem>
    )
}
