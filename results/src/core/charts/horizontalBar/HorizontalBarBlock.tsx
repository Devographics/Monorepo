import React, { memo, useState } from 'react'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart, {
    getChartData,
    getChartDataPath
} from 'core/charts/horizontalBar/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { BlockComponentProps } from 'core/types/index'
import { StandardQuestionData, BucketUnits } from '@devographics/types'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { MODE_GRID, MODE_FACET } from 'core/filters/constants'
import { useChartFilters } from 'core/filters/helpers'
import { useAllFilters } from 'core/charts/hooks'
import { useLegends } from 'core/helpers/legends'
import { BoxPlotChart } from '../boxPlot/BoxPlotChart'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: StandardQuestionData
}

const HorizontalBarBlock = ({ block, data, series }: HorizontalBarBlockProps) => {
    const {
        mode = 'relative',
        defaultUnits = BucketUnits.COUNT,
        translateData,
        i18nNamespace = block.fieldId || block.id,
        filtersState
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const addNoAnswer = units === BucketUnits.PERCENTAGE_SURVEY
    const chartLegends = useLegends({ block, addNoAnswer })

    const completion = data?.responses?.currentEdition?.completion
    const total = completion?.total

    const { chartFilters, setChartFilters, filterLegends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID, MODE_FACET] },
        providedFiltersState: filtersState
    })

    const allFilters = useAllFilters(block.id)
    let unitsOptions = [
        BucketUnits.PERCENTAGE_SURVEY,
        BucketUnits.PERCENTAGE_QUESTION,
        BucketUnits.COUNT
    ]
    if (chartFilters.facet) {
        // if filtering by facet, use special units
        unitsOptions = [BucketUnits.PERCENTAGE_BUCKET, BucketUnits.COUNT]
        const facetQuestion = allFilters.find(o => o.id === chartFilters?.facet?.id)
        // if this facet is in the form of numerical ranges, add the average of each range as unit too
        if (facetQuestion?.optionsAreRange) {
            unitsOptions.push(BucketUnits.AVERAGE)
            unitsOptions.push(BucketUnits.PERCENTILES)
        }
    }

    const defaultSeries = { name: 'default', data }

    const chartData = getChartData(data, block)

    const blockVariantProps = {
        units,
        setUnits,
        unitsOptions,
        data,
        getChartData,
        block,
        completion,
        chartFilters,
        setChartFilters,
        legendProps: { layout: 'vertical' }
    }

    if (data) {
        blockVariantProps.tables = [
            getTableData({
                data: chartData,
                valueKeys: [
                    BucketUnits.PERCENTAGE_SURVEY,
                    BucketUnits.PERCENTAGE_QUESTION,
                    BucketUnits.COUNT
                ],
                translateData,
                i18nNamespace: i18nNamespace
            })
        ]
    }

    if (
        filterLegends.length > 0 &&
        [
            BucketUnits.COUNT,
            BucketUnits.PERCENTAGE_SURVEY,
            BucketUnits.PERCENTAGE_QUESTION,
            BucketUnits.PERCENTAGE_BUCKET
        ].includes(units)
    ) {
        blockVariantProps.legends = filterLegends
    }

    const chartProps = {
        block,
        total,
        series: series || [{ name: 'default', data }],
        i18nNamespace,
        translateData,
        mode,
        units,
        colorVariant: 'primary',
        facet: chartFilters.facet,
        legends: chartLegends
    }

    return (
        <BlockVariant {...blockVariantProps}>
            <DynamicDataLoader
                block={block}
                chartFilters={chartFilters}
                setChartFilters={setChartFilters}
                units={units}
                setUnits={setUnits}
                layout="grid"
                defaultSeries={defaultSeries}
                providedSeries={series}
            >
                <ChartContainer fit={true}>
                    {units === BucketUnits.PERCENTILES ? (
                        <BoxPlotChart {...chartProps} variant="horizontal" />
                    ) : (
                        <HorizontalBarChart {...chartProps} />
                    )}
                </ChartContainer>
            </DynamicDataLoader>
        </BlockVariant>
    )
}

export default memo(HorizontalBarBlock)
