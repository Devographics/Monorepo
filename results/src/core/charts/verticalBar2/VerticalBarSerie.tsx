import React from 'react'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
import { getViewComponent } from './helpers/views'
import { useChartValues } from './helpers/chartValues'
import { VerticalBarChartState } from './types'
import { getItemFilters } from '../common2/helpers/filters'

export const VerticalBarSerie = (
    props: {
        serie: DataSeries<StandardQuestionData>
        serieIndex: number
    } & CommonProps<VerticalBarChartState>
) => {
    const { serie, serieIndex, block, chartState, variant, question } = props
    const editions = serie.data.responses.allEditions
    const chartValues = useChartValues({ editions, chartState, block, question })

    const viewProps = {
        ...props,
        editions,
        chartValues
    }

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const ViewComponent = getViewComponent(chartState.view)

    return (
        <GridItem key={serie.name} filters={itemFilters}>
            <ViewComponent {...viewProps} />

            <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre>
        </GridItem>
    )
}
