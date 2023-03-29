import React, { memo, useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart, { getChartData } from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { BlockComponentProps } from 'core/types/index'
import { StandardQuestionData, BucketUnits } from '@devographics/types'
import DynamicDataLoader from 'core/blocks/filters/dataloaders/DynamicDataLoader'
import { MODE_GRID, MODE_FACET } from 'core/blocks/filters/constants'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { useAllFilters } from 'core/charts/hooks'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: StandardQuestionData
}

const HorizontalBarBlock = ({ block, data }: HorizontalBarBlockProps) => {
    const {
        mode = 'relative',
        defaultUnits = BucketUnits.COUNT,
        translateData,
        chartNamespace = block.blockNamespace ?? block.id
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const completion = data?.responses?.currentEdition?.completion
    const { total } = completion

    const { chartFilters, setChartFilters, legends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID, MODE_FACET] }
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
        const facetOptions = allFilters.find(o => o.id === chartFilters?.facet?.id)?.options
        // if this facet can be quantified numerically and has averages, add that as unit too
        if (facetOptions && typeof facetOptions[0].average !== 'undefined') {
            unitsOptions.push(BucketUnits.AVERAGE)
        }
    }

    // note: HorizontalBarChart accepts multiple data series
    const defaultSeries = { name: 'default', data }

    return (
        <Block
            units={units}
            setUnits={setUnits}
            unitsOptions={unitsOptions}
            data={data}
            getChartData={getChartData}
            tables={[
                getTableData({
                    data: getChartData(data),
                    valueKeys: ['percentageSurvey', 'percentageQuestion', 'count'],
                    translateData,
                    i18nNamespace: chartNamespace
                })
            ]}
            block={block}
            completion={completion}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
            legendProps={{ layout: 'vertical' }}
            {...(legends.length > 0 ? { legends } : {})}
        >
            <DynamicDataLoader
                block={block}
                chartFilters={chartFilters}
                setUnits={setUnits}
                layout="grid"
                defaultSeries={defaultSeries}
            >
                <ChartContainer fit={false}>
                    <HorizontalBarChart
                        total={total}
                        series={[defaultSeries]}
                        i18nNamespace={chartNamespace}
                        translateData={translateData}
                        mode={mode}
                        units={units}
                        colorVariant={'primary'}
                        facet={chartFilters.facet}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </Block>
    )
}

export default memo(HorizontalBarBlock)
