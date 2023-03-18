import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
// import ParticipationByCountryChart from 'core/charts/demographics/ParticipationByCountryChart'
import { getTableData } from 'core/helpers/datatables'
import { getCountryName } from 'core/helpers/countries'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { MODE_GRID } from 'core/blocks/filters/constants'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'
import { useAllChartsOptions } from 'core/charts/hooks'

const processBlockData = data => {
    return data && data.map(b => ({ ...b, label: getCountryName(b.id) }))
}

const ParticipationByCountryBlock = ({
    block,
    data: questionData,
    triggerId,
    units: defaultUnits = 'percentageSurvey'
}) => {
    const chartData = questionData?.responses?.currentEdition

    const {
        id,
        mode = 'relative',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id
    } = block

    const { completion, buckets } = chartData
    const { total } = completion

    const [units, setUnits] = useState(defaultUnits)

    const { chartFilters, setChartFilters, legends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID] }
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
            tables={[
                getTableData({
                    data: processBlockData(buckets)
                })
            ]}
            units={units}
            setUnits={setUnits}
            unitsOptions={unitsOptions}
            data={chartData}
            block={block}
            completion={chartData.completion}
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
                processBlockData={processBlockData}
            >
                <ChartContainer fit={false}>
                    <HorizontalBarChart
                        total={total}
                        i18nNamespace={chartNamespace}
                        translateData={translateData}
                        mode={mode}
                        units={units}
                        buckets={processBlockData(buckets)}
                        facet={chartFilters.facet}
                    />
                </ChartContainer>
            </DynamicDataLoader>
            {/* <ChartContainer height={600} minWidth={800}>
        <div style={{ height: '100%', overflow: 'hidden' }} className={`ParticipationByCountryChart ${chartClassName}`}>
          <ParticipationByCountryChart units={units} data={buckets} />
        </div>
      </ChartContainer> */}
        </Block>
    )
}

export default memo(ParticipationByCountryBlock)
