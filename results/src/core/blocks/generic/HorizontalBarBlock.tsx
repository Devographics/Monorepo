import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { ResultsByYear, BlockComponentProps } from 'core/types'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { MODE_GRID, MODE_FACET } from 'core/blocks/filters/constants'
import { useFilterLegends, getInitFilters } from 'core/blocks/filters/helpers'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'
import { useAllChartsOptions } from 'core/charts/hooks'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: ResultsByYear
}

/*

Feed in data used by block and get out data usable by chart

*/
const processBlockData = data => data?.facets[0]?.buckets

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

    const { facets, completion } = data
    const buckets = processBlockData(data)
    const { total } = completion

    // contains the filters that define the series
    const [chartFilters, setChartFilters] = useState(
        getInitFilters({ supportedModes: [MODE_GRID, MODE_FACET] })
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
            units={controlledUnits ?? units}
            setUnits={setUnits}
            unitsOptions={unitsOptions}
            data={data}
            tables={[
                getTableData({
                    data: buckets,
                    valueKeys: ['percentage_survey', 'percentage_question', 'count'],
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
                processBlockData={processBlockData}
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

HorizontalBarBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        dataPath: PropTypes.string.isRequired,
        showDescription: PropTypes.bool,
        translateData: PropTypes.bool,
        mode: PropTypes.oneOf(['absolute', 'relative']),
        defaultUnits: PropTypes.oneOf(['percentage_survey', 'percentage_question', 'count']),
        colorVariant: PropTypes.oneOf(['primary', 'secondary'])
    }).isRequired,
    data: PropTypes.shape({
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

export default memo(HorizontalBarBlock)
