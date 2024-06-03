import React from 'react'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
// import { getViewComponent } from './helpers/views'
// import { useChartValues } from './helpers/chartValues'
// import { MultiRatioSerie, VerticalBarChartState } from './types'
import { getItemFilters } from '../common2/helpers/filters'
import Columns from '../verticalBar2/columns/Columns'
import { Lines } from '../verticalBar2/lines'
import { MultiRatioSerie, MultiRatiosChartState } from './types'
import { useChartValues } from './helpers/chartValues'
import { ColumnEmpty } from '../verticalBar2/columns/ColumnEmpty'

export const RatiosSerie = (
    props: {
        serie: MultiRatioSerie
        serieIndex: number
    } & CommonProps<MultiRatiosChartState>
) => {
    const { serie, serieIndex, block, chartState, variant, question } = props
    const items = serie.data
    const chartValues = useChartValues({ items, chartState, block, question })

    const itemFilters = getItemFilters({ variant, block, serieIndex })

    const commonProps = { block, chartState, chartValues }
    const { years } = chartValues

    return (
        <GridItem key={serie.name} filters={itemFilters}>
            <Columns {...commonProps} hasZebra={true} labelId="average_foo">
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
                    {years.map((year, i) => (
                        <ColumnEmpty
                            {...props}
                            chartValues={chartValues}
                            columnIndex={i}
                            key={year}
                            year={year}
                        />
                    ))}
                    <Lines
                        {...commonProps}
                        items={items.map(item => ({
                            id: item.id,
                            editions: item.responses.allEditions
                        }))}
                    />
                </>
            </Columns>

            {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}
        </GridItem>
    )
}

export default RatiosSerie
