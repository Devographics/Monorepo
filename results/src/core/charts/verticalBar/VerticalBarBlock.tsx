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
    data: StandardQuestionData
}

const VerticalBarBlock = ({ block, data, context }: VerticalBarBlockProps) => {
    const {
        defaultUnits = BucketUnits.PERCENTAGE_SURVEY,
        translateData,
        i18nNamespace = block.id
    } = block

    const { width } = context

    const [units, setUnits] = useState(defaultUnits)

    const addNoAnswer = units === BucketUnits.PERCENTAGE_SURVEY

    const chartLegends = useLegends({ block, addNoAnswer })

    const completion = data?.responses?.currentEdition?.completion

    const { total } = completion

    const { chartFilters, setChartFilters, filterLegends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_COMBINED, MODE_FACET] }
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
            unitsOptions.push(BucketUnits.PERCENTILES)
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
        series: [defaultSeries]
    }
    return (
        <BlockVariant
            tables={[
                getTableData({
                    // legends: bucketKeys,
                    data: getChartData(data),
                    valueKeys: MAIN_UNITS,
                    translateData,
                    i18nNamespace: i18nNamespace
                })
            ]}
            units={units}
            setUnits={setUnits}
            completion={completion}
            data={getChartData(data)}
            block={block}
            unitsOptions={unitsOptions}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
            legendProps={{ layout: 'vertical' }}
            {...(filterLegends.length > 0 ? { legends: filterLegends } : {})}
        >
            <DynamicDataLoader
                block={block}
                chartFilters={chartFilters}
                setUnits={setUnits}
                defaultSeries={defaultSeries}
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
