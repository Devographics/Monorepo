import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
// import ParticipationByCountryChart from 'core/charts/demographics/ParticipationByCountryChart'
import { getTableData } from 'core/helpers/datatables'
import { getCountryName } from 'core/helpers/countries'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { BEHAVIOR_MULTIPLE } from 'core/blocks/filters/constants'
import { useFilterLegends, getInitFilters } from 'core/blocks/filters/helpers'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'
import { useAllChartsOptions } from 'core/charts/hooks'

const processBlockData = (data) => {
    return data && data.map(b => ({ ...b, label: getCountryName(b.id) }))
}

const ParticipationByCountryBlock = ({
    block,
    data,
    triggerId,
    units: defaultUnits = 'percentage_survey'
}) => {
    const {
        id,
        mode = 'relative',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id
    } = block

    const { completion } = data
    const { total } = completion

    const [units, setUnits] = useState(defaultUnits)

    const buckets = data.facets[0].buckets

    // contains the filters that define the series
    const [chartFilters, setChartFilters] = useState(
        getInitFilters({ behavior: BEHAVIOR_MULTIPLE })
    )

    const legends = useFilterLegends({
        chartFilters
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
            data={data}
            block={block}
            completion={data.completion}
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

ParticipationByCountryBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired
    }).isRequired,
    data: PropTypes.shape({
        completion: PropTypes.shape({
            count: PropTypes.number.isRequired,
            percentage_survey: PropTypes.number.isRequired
        }).isRequired,
        facets: PropTypes.arrayOf(
            PropTypes.shape({
                buckets: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
                    })
                ).isRequired
            })
        ).isRequired
    }).isRequired
}

export default memo(ParticipationByCountryBlock)
