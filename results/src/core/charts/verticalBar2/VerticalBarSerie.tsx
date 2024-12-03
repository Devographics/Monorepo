import React from 'react'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
import { getViewComponent, getViewDefinition } from './helpers/views'
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
    const viewDefinition = getViewDefinition(chartState.view)
    const { getLineItems } = viewDefinition
    const lineItems = getLineItems({ serie, question, chartState })

    const chartValues = useChartValues({ lineItems, chartState, block, question })

    const viewProps = {
        ...props,
        lineItems,
        chartValues
    }

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const ViewComponent = getViewComponent(chartState.view)

    return (
        <GridItem<DataSeries<StandardQuestionData>>
            key={serie.name}
            filters={itemFilters}
            serie={serie}
            block={block}
        >
            <ViewComponent {...viewProps} />

            {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}
        </GridItem>
    )
}
