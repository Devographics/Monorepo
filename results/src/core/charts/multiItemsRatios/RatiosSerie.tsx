import React from 'react'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
// import { getViewComponent } from './helpers/views'
// import { useChartValues } from './helpers/chartValues'
// import { MultiRatioSerie, VerticalBarChartState } from './types'
import { getItemFilters } from '../common2/helpers/filters'
import Columns from '../verticalBar2/columns/Columns'
import { Lines } from '../verticalBar2/lines'
import { EditionWithRank, MultiRatioSerie, MultiRatiosChartState, Ratios } from './types'
import { useChartValues } from './helpers/chartValues'
import { ColumnEmpty } from '../verticalBar2/columns/ColumnEmpty'
import { LineItem } from '../verticalBar2/types'
import { StandardQuestionData } from '@devographics/types'
import { getEditionByYear } from '../verticalBar2/helpers/other'
import sortBy from 'lodash/sortBy'
import { LegendItem } from '``./Legend-old'
import { getAllEditions } from './helpers/other'
import { multiRatiosViewDefinition } from './helpers/view'
import { viewDefinitions } from '../horizontalBar2/helpers/views'

export const RatiosSerie = (
    props: {
        legendItems: LegendItem[]
        serie: MultiRatioSerie
        serieIndex: number
    } & CommonProps<MultiRatiosChartState>
) => {
    const { serie, serieIndex, block, chartState, variant, question, legendItems } = props
    const items = serie.data
    const chartValues = useChartValues({ items, chartState, block, question, legendItems })
    const { viewDefinition } = chartState
    const { getLineItems } = viewDefinition
    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const commonProps = { block, chartState, chartValues }
    const { columnIds } = chartValues
    const { view } = chartState

    const lineItems = getLineItems({ serie, question, chartState })

    return (
        <GridItem<MultiRatioSerie>
            key={serie.name}
            filters={itemFilters}
            serie={serie}
            block={block}
        >
            <Columns {...commonProps} hasZebra={true}>
                <>
                    {/* {props.editions.map((edition, i) => (
                        <ColumnSingle
                            columnIndex={i}
                            {...props}
                            key={edition.editionId}
                            edition={edition}
                            showCount={false}
                            showBar={false}
                        />
                    ))} */}
                    {columnIds.map((columnId, i) => (
                        <ColumnEmpty
                            {...props}
                            chartValues={chartValues}
                            columnIndex={i}
                            key={columnId}
                            columnId={columnId}
                        />
                    ))}
                    <Lines<EditionWithRank> {...commonProps} lineItems={lineItems} />
                </>
            </Columns>

            {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}
        </GridItem>
    )
}

export default RatiosSerie
