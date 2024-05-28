import React from 'react'
import { StandardQuestionData } from '@devographics/types'
import { CustomizationDefinition, CustomizationFiltersSeries, DataSeries } from 'core/filters/types'
import { getChartBuckets } from '../horizontalBar2/helpers/other'
import { useChartValues } from '../horizontalBar2/helpers/chartValues'
import { GridItem } from '../common2'
import { CommonProps } from '../common2/types'
import take from 'lodash/take'
import { CustomVariant } from 'core/filters/helpers'
import { BlockVariantDefinition } from 'core/types'
import { getViewComponent } from './helpers/views'

const getItemFilters = ({
    variant,
    block,
    serieIndex
}: {
    variant?: CustomVariant
    block?: BlockVariantDefinition
    serieIndex: number
}) => {
    const filtersState = variant?.chartFilters || block?.filtersState
    if (!filtersState) {
        return
    }
    const showDefaultSeries = filtersState?.options?.showDefaultSeries || false
    const defaultFilters: CustomizationFiltersSeries = { isDefault: true, conditions: [] }
    const filters = showDefaultSeries
        ? [defaultFilters, ...filtersState.filters]
        : filtersState?.filters
    const itemFilters = filters?.[serieIndex]
    return itemFilters
}

export const VerticalBarSerie = (
    props: {
        serie: DataSeries<StandardQuestionData>
        serieIndex: number
    } & CommonProps
) => {
    const { serie, serieIndex, block, chartState, variant, question } = props
    const { rowsLimit } = chartState
    // const buckets = getChartBuckets({ serie, block, chartState })
    const buckets = []
    const chartValues = useChartValues({ buckets, chartState, block, question })

    const editions = serie.data.responses.allEditions

    // let allRowOffsets = allRowsCellDimensions.map(cd =>
    //     getRowOffset({
    //         firstRowCellDimensions: allRowsCellDimensions[0],
    //         cellDimensions: cd,
    //         chartState
    //     })
    // )

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
        </GridItem>
    )
}
