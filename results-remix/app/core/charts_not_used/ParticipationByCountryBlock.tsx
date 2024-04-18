import React, { memo, useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
// import ParticipationByCountryChart from 'core/charts/demographics/ParticipationByCountryChart'
import { getTableData } from 'core/helpers/datatables'
import HorizontalBarChart from 'core/charts/horizontalBar/HorizontalBarChart'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { MODE_GRID } from 'core/filters/constants'
import { useChartFilters } from 'core/filters/helpers'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'
import { useAllQuestionsWithOptions } from 'core/charts/hooks'

const ParticipationByCountryBlock = ({
    block,
    data,
    triggerId,
    units: defaultUnits = 'percentageSurvey'
}) => {
    const chartData = data?.responses?.currentEdition

    const { id, mode = 'relative', translateData, i18nNamespace = block.id } = block

    const { completion, buckets } = chartData
    const { total } = completion

    const [units, setUnits] = useState(defaultUnits)

    const { chartFilters, setChartFilters, legends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID] }
    })

    const allChartsOptions = useAllQuestionsWithOptions()

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
                    data: buckets
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
            >
                <ChartContainer fit={false}>
                    <HorizontalBarChart
                        total={total}
                        i18nNamespace={i18nNamespace}
                        translateData={translateData}
                        mode={mode}
                        units={units}
                        data={data}
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
