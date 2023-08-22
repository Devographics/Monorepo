import React, { memo, useState } from 'react'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import VerticalBarChart, { getChartData } from 'core/charts/verticalBar/VerticalBarChart'
import { useLegends } from 'core/helpers/legends'
import { BlockComponentProps } from 'core/types/index'
import { StandardQuestionData, BucketUnits } from '@devographics/types'
import { getTableData } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/filters/helpers'
import { MODE_COMBINED, MODE_FACET } from 'core/filters/constants'
import { useAllChartsOptions } from 'core/charts/hooks'
import { MAIN_UNITS } from '@devographics/constants'
import { BoxPlotChart } from 'core/charts/boxPlot/BoxPlotChart'

export interface VerticalBarBlockProps extends BlockComponentProps {
    // legacy
    data: StandardQuestionData
    // new: charts should always accept an array of series just in case
    series: StandardQuestionData[]
}

const VerticalBarBlock = ({ block, data, series, pageContext }: VerticalBarBlockProps) => {
    const {
        defaultUnits = BucketUnits.PERCENTAGE_SURVEY,
        translateData,
        i18nNamespace = block.id,
        filtersState
    } = block

    const { width } = pageContext

    const [units, setUnits] = useState(defaultUnits)

    const addNoAnswer = units === BucketUnits.PERCENTAGE_SURVEY

    const chartLegends = useLegends({ block, addNoAnswer })

    const completion = data?.responses?.currentEdition?.completion
    const total = completion?.total

    const { chartFilters, setChartFilters, filterLegends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_COMBINED, MODE_FACET] },
        providedFiltersState: filtersState
    })

    const allChartsOptions = useAllChartsOptions()

    let unitsOptions = [
        BucketUnits.PERCENTAGE_SURVEY,
        BucketUnits.PERCENTAGE_QUESTION,
        BucketUnits.COUNT
    ]
    if (chartFilters.facet) {
        // if filtering by facet, use special units
        unitsOptions = [BucketUnits.PERCENTAGE_BUCKET, BucketUnits.COUNT]
        const facetQuestion = allChartsOptions.find(o => o.id === chartFilters?.facet?.id)
        // if this facet can be quantified numerically and has averages, add that as unit too
        if (facetQuestion?.optionsAreRange) {
            unitsOptions.push(BucketUnits.AVERAGE)
            // unitsOptions.push(BucketUnits.PERCENTILES)
        }
    }

    const defaultSeries = { name: 'default', data }

    const chartProps = {
        block,
        legends: chartLegends,
        filterLegends,
        total,
        i18nNamespace,
        translateData,
        units,
        viewportWidth: width,
        colorVariant: 'primary',
        series: series || [defaultSeries]
    }

    const blockVariantProps = {
        units,
        setUnits,
        completion,
        data: series || getChartData(data),
        block,
        unitsOptions,
        chartFilters,
        setChartFilters,
        legendProps: { layout: 'vertical' }
    }

    if (data) {
        blockVariantProps.tables = [
            getTableData({
                // legends: bucketKeys,
                data: getChartData(data),
                valueKeys: MAIN_UNITS,
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

    return (
        <BlockVariant {...blockVariantProps}>
            <DynamicDataLoader
                block={block}
                chartFilters={chartFilters}
                setChartFilters={setChartFilters}
                units={units}
                setUnits={setUnits}
                defaultSeries={defaultSeries}
                providedSeries={series}
            >
                <ChartContainer fit={true}>
                    {units === BucketUnits.PERCENTILES ? (
                        <BoxPlotChart {...chartProps} />
                    ) : (
                        <VerticalBarChart {...chartProps} />
                    )}
                </ChartContainer>
            </DynamicDataLoader>
        </BlockVariant>
    )
}

export default memo(VerticalBarBlock)
