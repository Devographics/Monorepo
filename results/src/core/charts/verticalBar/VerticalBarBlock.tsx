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

export interface VerticalBarBlockProps extends BlockComponentProps {
    data: StandardQuestionData
}

const VerticalBarBlock = ({ block, data, context }: VerticalBarBlockProps) => {
    const {
        defaultUnits = BucketUnits.PERCENTAGE_SURVEY,
        translateData,
        chartNamespace = block.blockNamespace ?? block.id
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
        const facetField = allChartsOptions.find(o => o.id === chartFilters?.facet?.id)
        // if this facet can be quantified numerically and has averages, add that as unit too
        if (typeof facetField?.options[0].average !== 'undefined') {
            unitsOptions.push(BucketUnits.AVERAGE)
        }
    }

    const defaultSeries = { name: 'default', data }

    return (
        <BlockVariant
            tables={[
                getTableData({
                    // legends: bucketKeys,
                    data: getChartData(data),
                    valueKeys: MAIN_UNITS,
                    translateData
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
                    <VerticalBarChart
                        legends={chartLegends}
                        total={total}
                        i18nNamespace={chartNamespace}
                        translateData={translateData}
                        units={units}
                        viewportWidth={width}
                        colorVariant={'primary'}
                        series={[defaultSeries]}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </BlockVariant>
    )
}

export default memo(VerticalBarBlock)
