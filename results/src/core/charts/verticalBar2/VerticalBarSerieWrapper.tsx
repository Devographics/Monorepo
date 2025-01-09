import React from 'react'
import '../common2/ChartsCommon.scss'
import './VerticalBar.scss'
import { DataSeries } from 'core/filters/types'
import { CommonProps } from '../common2/types'
import { GridItem } from '../common2'
import { getItemFilters } from '../common2/helpers/filters'

export const VerticalBarSerieWrapper = <SerieData, ChartStateType>(
    props: {
        serie: DataSeries<SerieData>
        serieIndex: number
        children: React.ReactNode
    } & CommonProps<ChartStateType>
) => {
    const { serie, serieIndex, block, variant, children } = props
    const itemFilters = getItemFilters({ variant, block, serieIndex })

    return (
        <GridItem<DataSeries<SerieData>>
            key={serie.name}
            filters={itemFilters}
            serie={serie}
            block={block}
        >
            {children}
        </GridItem>
    )
}
