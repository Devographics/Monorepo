import React, { memo, useState } from 'react'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import VerticalBarChart, { getChartData } from 'core/charts/generic/VerticalBarChart'
import { useLegends } from 'core/helpers/useBucketKeys'
import { useOptions } from 'core/helpers/options'
import { BlockComponentProps, BlockUnits } from 'core/types/index'
import { StandardQuestionData, BucketUnits } from '@devographics/types'
import { getTableData } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { MODE_COMBINED, MODE_FACET } from 'core/blocks/filters/constants'
import { useAllChartsOptions } from 'core/charts/hooks'
import { MAIN_UNITS } from '@devographics/constants'

export interface VerticalBarBlockProps extends BlockComponentProps {
    data: StandardQuestionData
    controlledUnits: BlockUnits
    isCustom: boolean
}

const VerticalBarBlock = ({
    block,
    data,
    controlledUnits,
    isCustom,
    context
}: VerticalBarBlockProps) => {
    const {
        defaultUnits = BucketUnits.PERCENTAGE_SURVEY,
        translateData,
        chartNamespace = block.blockNamespace ?? block.id
    } = block

    const { width } = context

    const [uncontrolledUnits, setUnits] = useState(defaultUnits)
    const units = controlledUnits || uncontrolledUnits

    const addNoAnswer = units === BucketUnits.PERCENTAGE_SURVEY

    const chartOptions = useOptions(block.id)
    const bucketKeys = chartOptions && useLegends(block, chartOptions, undefined, addNoAnswer)

    const completion = data?.responses?.currentEdition?.completion

    const { total } = completion

    const { chartFilters, setChartFilters, legends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_COMBINED, MODE_FACET] }
    })

    const allChartsOptions = useAllChartsOptions()
    let unitsOptions = Object.values(BucketUnits)
    if (chartFilters.facet) {
        // if filtering by facet, use special units
        unitsOptions = [BucketUnits.PERCENTAGE_BUCKET, BucketUnits.COUNT]
        const facetField = allChartsOptions.find(o => o.id === chartFilters?.facet?.id)
        console.log(chartFilters)
        console.log(facetField)
        // if this facet can be quantified numerically and has averages, add that as unit too
        if (typeof facetField?.options[0].average !== 'undefined') {
            unitsOptions.push(BucketUnits.AVERAGE)
        }
    }

    // note: VerticalBarChart accepts multiple data series
    const defaultSeries = { name: 'default', data }

    return (
        <BlockVariant
            tables={[
                getTableData({
                    legends: bucketKeys,
                    data: getChartData(data),
                    valueKeys: MAIN_UNITS,
                    translateData
                })
            ]}
            units={controlledUnits ?? units}
            setUnits={setUnits}
            completion={completion}
            data={getChartData(data)}
            block={block}
            unitsOptions={unitsOptions}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
            legendProps={{ layout: 'vertical' }}
            {...(legends.length > 0 ? { legends } : {})}
        >
            <DynamicDataLoader
                completion={completion}
                block={block}
                chartFilters={chartFilters}
                setUnits={setUnits}
                defaultSeries={defaultSeries}
                getChartData={getChartData}
            >
                <ChartContainer fit={true}>
                    <VerticalBarChart
                        bucketKeys={bucketKeys}
                        total={total}
                        i18nNamespace={chartNamespace}
                        translateData={translateData}
                        units={controlledUnits ?? units}
                        viewportWidth={width}
                        colorVariant={isCustom ? 'secondary' : 'primary'}
                        series={[defaultSeries]}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </BlockVariant>
    )
}

export default memo(VerticalBarBlock)
