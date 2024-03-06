import React, { memo, useState } from 'react'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart, {
    getChartData,
    getChartDataPath
} from 'core/charts/horizontalBar/HorizontalBarChart'
import { getTableData, TableData } from 'core/helpers/datatables'
import { BlockComponentProps } from 'core/types/index'
import { StandardQuestionData, BucketUnits } from '@devographics/types'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { MODE_GRID, MODE_FACET } from 'core/filters/constants'
import { useChartFilters } from 'core/filters/helpers'
import { useAllFilters } from 'core/charts/hooks'
import { useLegends } from 'core/helpers/legends'
import HorizontalBoxPlotChart from '../boxPlotHorizontal/HorizontalBoxPlotChart'
import { DataSeries } from 'core/filters/types'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

const HorizontalBarBlock = ({ block, question, data, series }: HorizontalBarBlockProps) => {
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

    const completion =
        data?.combined?.currentEdition?.completion || data?.responses?.currentEdition?.completion
    const total = completion?.total

    const chartData = series ? getChartData(series[0].data, block) : getChartData(data, block)

    if (!chartData) {
        console.log(block)
        if (series) {
            console.log({ series })
            console.log(getChartData(series[0].data, block))
        } else {
            console.log({ data })
            console.log(getChartData(data, block))
        }
        throw new Error(`HorizontalBarBlock: no chart data`)
    }

    const { chartFilters, setChartFilters, filterLegends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID, MODE_FACET] },
        buckets: chartData,
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
        if (facetQuestion?.optionsAreRange || facetQuestion?.optionsAreNumeric) {
            unitsOptions.push(BucketUnits.AVERAGE)
            // unitsOptions.push(BucketUnits.MEDIAN)
            unitsOptions = [BucketUnits.PERCENTILES, ...unitsOptions]
        }
    }

    const defaultSeries = { name: 'default', data }

    const blockVariantProps: any & { tables: Array<TableData> } = {
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

    // filter legends are not part of the BlockVariant anymore, they're part of
    // the DataLoader wrapper

    // if (
    //     filterLegends.length > 0 &&
    //     [
    //         BucketUnits.COUNT,
    //         BucketUnits.PERCENTAGE_SURVEY,
    //         BucketUnits.PERCENTAGE_QUESTION,
    //         BucketUnits.PERCENTAGE_BUCKET
    //     ].includes(units)
    // ) {
    //     blockVariantProps.legends = filterLegends
    // }

    const chartProps = {
        block,
        question,
        total,
        series: series || [{ name: 'default', data }],
        i18nNamespace,
        translateData,
        mode,
        units,
        colorVariant: 'primary' as const,
        facet: chartFilters.facet,
        legends: chartLegends
    }

    return (
        <BlockVariant {...blockVariantProps}>
            <DynamicDataLoader<StandardQuestionData>
                {...{
                    block,
                    chartFilters,
                    setChartFilters,
                    units,
                    setUnits,
                    layout: 'grid',
                    defaultSeries,
                    providedSeries: series,
                    getChartData
                }}
            >
                {units === BucketUnits.PERCENTILES ? (
                    <ChartContainer>
                        <HorizontalBoxPlotChart {...chartProps} />
                    </ChartContainer>
                ) : (
                    <ChartContainer fit={true}>
                        <HorizontalBarChart {...chartProps} />
                    </ChartContainer>
                )}
            </DynamicDataLoader>
        </BlockVariant>
    )
}

export default memo(HorizontalBarBlock)
