import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import HorizontalBarChart from 'core/charts/generic/HorizontalBarChart'
import { getTableData } from 'core/helpers/datatables'
import { ResultsByYear, BlockComponentProps } from 'core/types'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { BEHAVIOR_MULTIPLE } from 'core/blocks/filters/constants'
import { useFilterLegends, getInitFilters } from 'core/blocks/filters/helpers'
import { defaultOptions } from 'core/blocks/block/BlockUnitsSelector'

export interface HorizontalBarBlockProps extends BlockComponentProps {
    data: ResultsByYear
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

    const { facets, completion } = data
    const buckets = facets[0].buckets
    const { total } = completion

    // contains the filters that define the series
    const [chartFilters, setChartFilters] = useState(getInitFilters({ behavior: BEHAVIOR_MULTIPLE }))

    const legends = useFilterLegends({
        chartFilters,
    })

    return (
        <Block
            units={controlledUnits ?? units}
            setUnits={setUnits}
            unitsOptions={chartFilters.facet ? ['percentage_bucket', 'count'] : defaultOptions}
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
