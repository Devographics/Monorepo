import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { keys } from 'core/bucket_keys'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import VerticalBarChart, { getChartData } from 'core/charts/generic/VerticalBarChart'
import { useLegends } from 'core/helpers/useBucketKeys'
import { useOptions } from 'core/helpers/options'
// import T from 'core/i18n/T'
import { BlockComponentProps, BlockUnits } from '@types/index'
import {
    QuestionData,
    ResponseEditionData,
    StandardQuestionData,
    Bucket
} from '@devographics/types'
import { getTableData } from 'core/helpers/datatables'
import sumBy from 'lodash/sumBy'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { useChartFilters, combineBuckets } from 'core/blocks/filters/helpers'
import { MODE_COMBINED, MODE_FACET } from 'core/blocks/filters/constants'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'
import { useAllChartsOptions } from 'core/charts/hooks'
import { MAIN_UNITS } from '@devographics/constants'

export interface VerticalBarBlockProps extends BlockComponentProps {
    data: StandardQuestionData
    controlledUnits: BlockUnits
    isCustom: boolean
}

/*

Combine multiple series into a single chart

*/
export const combineSeries = (
    defaultBuckets: Bucket[],
    seriesBlockData: StandardQuestionData[]
) => {
    // get chart data (buckets) for each series
    const otherBucketsArray = seriesBlockData.map((blockData, i) => getChartData(blockData))

    /*

    In case buckets have a processing function applied (for example to merge them into
    fewer buckets), apply it now to the new buckets

    */
    const combinedBuckets = combineBuckets({
        defaultBuckets,
        otherBucketsArray
    })
    console.log(combinedBuckets)
    return combinedBuckets
}

const VerticalBarBlock = ({
    block,
    data,
    controlledUnits,
    isCustom,
    context
}: VerticalBarBlockProps) => {
    const {
        defaultUnits = 'percentageSurvey',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id
    } = block

    const { width } = context

    const [uncontrolledUnits, setUnits] = useState(defaultUnits)
    const units = controlledUnits || uncontrolledUnits

    const addNoAnswer = units === 'percentageSurvey'

    const chartOptions = useOptions(block.id)
    const bucketKeys = chartOptions && useLegends(block, chartOptions, undefined, addNoAnswer)

    const completion = data?.responses?.currentEdition?.completion

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
                data={data}
                getChartData={getChartData}
                combineSeries={combineSeries}
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
                        data={data}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </BlockVariant>
    )
}

export default memo(VerticalBarBlock)
