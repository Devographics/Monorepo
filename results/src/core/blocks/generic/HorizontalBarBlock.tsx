import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { BlockComponentProps } from '@types/index'
import { StandardQuestionData } from '@devographics/types'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { MODE_GRID, MODE_FACET } from 'core/blocks/filters/constants'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'
import { useAllChartsOptions } from 'core/charts/hooks'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: StandardQuestionData
}

const HorizontalBarBlock = ({
    block,
    data: questionData,
    controlledUnits,
    isCustom
}: HorizontalBarBlockProps) => {
    const chartData = questionData?.responses?.currentEdition
    if (!chartData) {
        throw Error(`No data found for block ${block.id}`)
    }

    const {
        id,
        mode = 'relative',
        defaultUnits = 'count',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id,
        colorVariant
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const { buckets, completion } = chartData
    const { total } = completion

    const { chartFilters, setChartFilters, legends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID, MODE_FACET] }
    })

    const allChartsOptions = useAllChartsOptions()
    let unitsOptions = defaultOptions
    if (chartFilters.facet) {
        // if filtering by facet, use special units
        unitsOptions = ['percentage_bucket', 'count']
        const facetOptions = allChartsOptions[chartFilters.facet]
        // if this facet can be quantified numerically and has averages, add that as unit too
        if (typeof facetOptions[0].average !== 'undefined') {
            unitsOptions.push('average')
        }
    }

    return (
        <Block
            units={controlledUnits ?? units}
            setUnits={setUnits}
            unitsOptions={unitsOptions}
            data={chartData}
            tables={[
                getTableData({
                    data: buckets,
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
                completion={completion}
                defaultBuckets={buckets}
                block={block}
                chartFilters={chartFilters}
                setUnits={setUnits}
                layout="grid"
            >
                <ChartContainer fit={false}>
                    <HorizontalBarChart
                        total={total}
                        buckets={buckets}
                        i18nNamespace={chartNamespace}
                        translateData={translateData}
                        mode={mode}
                        units={controlledUnits ?? units}
                        colorVariant={isCustom ? 'secondary' : 'primary'}
                        facet={chartFilters.facet}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </Block>
    )
}

export default memo(HorizontalBarBlock)
