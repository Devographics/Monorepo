import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { keys } from 'core/bucket_keys'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import VerticalBarChart from 'core/charts/generic/VerticalBarChart'
import { useLegends } from 'core/helpers/useBucketKeys'
import { useOptions } from 'core/helpers/options'
// import T from 'core/i18n/T'
import { BlockComponentProps, BlockUnits } from '@types/index'
import { QuestionData, EditionData } from '@devographics/types'
import { getTableData } from 'core/helpers/datatables'
import sumBy from 'lodash/sumBy'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { MODE_COMBINED, MODE_FACET } from 'core/blocks/filters/constants'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'
import { useAllChartsOptions } from 'core/charts/hooks'

export interface VerticalBarBlockProps extends BlockComponentProps {
    data: QuestionData
    controlledUnits: BlockUnits
    isCustom: boolean
}

const VerticalBarBlock = ({
    block,
    data: blockData,
    controlledUnits,
    isCustom,
    context
}: VerticalBarBlockProps) => {
    const chartData = blockData?.responses?.currentEdition

    if (!chartData) {
        throw new Error(`VerticalBarBlock: Missing chart data for block ${block.id}.`)
    }

    const {
        // id,
        mode = 'relative',
        defaultUnits = 'percentageSurvey',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id,
        colorVariant
    } = block

    const { width, currentEdition } = context
    const { year: currentYear } = currentEdition

    const [uncontrolledUnits, setUnits] = useState(defaultUnits)
    const units = controlledUnits || uncontrolledUnits

    const addNoAnswer = units === 'percentageSurvey'

    const chartOptions = useOptions(block.id)
    const bucketKeys = chartOptions && useLegends(block, chartOptions, undefined, addNoAnswer)

    const { completion } = chartData

    const buckets = chartData.buckets
    const { total } = completion

    const { chartFilters, setChartFilters, legends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_COMBINED, MODE_FACET] }
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
        <BlockVariant
            tables={[
                getTableData({
                    legends: bucketKeys,
                    data: buckets,
                    valueKeys: ['percentageSurvey', 'percentageQuestion', 'count'],
                    translateData
                })
            ]}
            units={controlledUnits ?? units}
            setUnits={setUnits}
            completion={completion}
            data={chartData}
            block={block}
            unitsOptions={unitsOptions}
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
            >
                <ChartContainer fit={true}>
                    <VerticalBarChart
                        bucketKeys={bucketKeys}
                        total={total}
                        buckets={buckets}
                        i18nNamespace={chartNamespace}
                        translateData={translateData}
                        units={controlledUnits ?? units}
                        viewportWidth={width}
                        colorVariant={isCustom ? 'secondary' : 'primary'}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </BlockVariant>
    )
}

export default memo(VerticalBarBlock)
