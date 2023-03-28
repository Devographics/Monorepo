import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart, { getChartData } from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { BlockComponentProps } from '@types/index'
import { StandardQuestionData } from '@devographics/types'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { MODE_GRID, MODE_FACET } from 'core/blocks/filters/constants'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'
import { useAllFilters } from 'core/charts/hooks'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: StandardQuestionData
}

const HorizontalBarBlock = ({
    block,
    data,
    controlledUnits,
    isCustom
}: HorizontalBarBlockProps) => {
    const {
        id,
        mode = 'relative',
        defaultUnits = 'count',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id,
        colorVariant
    } = block

    const [units, setUnits] = useState(defaultUnits)

    const completion = data?.responses?.currentEdition?.completion
    const { total } = completion

    const { chartFilters, setChartFilters, legends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID, MODE_FACET] }
    })

    const allFilters = useAllFilters(block.id)
    let unitsOptions = defaultOptions
    if (chartFilters.facet) {
        // if filtering by facet, use special units
        unitsOptions = ['percentage_bucket', 'count']
        const facetOptions = allFilters.find(o => o.id === chartFilters.facet)?.options
        // if this facet can be quantified numerically and has averages, add that as unit too
        if (facetOptions && typeof facetOptions[0].average !== 'undefined') {
            unitsOptions.push('average')
        }
    }

    return (
        <Block
            units={controlledUnits ?? units}
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
                completion={completion}
                block={block}
                chartFilters={chartFilters}
                setUnits={setUnits}
                layout="grid"
                blockData={data}
                getChartData={getChartData}
            >
                <ChartContainer fit={false}>
                    <HorizontalBarChart
                        total={total}
                        data={data}
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
