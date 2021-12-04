import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from 'styled-components'
import get from 'lodash/get'
import { ResponsiveBar } from '@nivo/bar'

const margin = {
    top: 81,
    bottom: 30,
}

const ToolsSectionOverviewChart = ({ data, units, current, namespace }) => {
    const theme = useTheme()

    const chartData = useMemo(
        () =>
            data.map((tool) => ({
                tool: tool.id,
                ...tool.experience.year.buckets.reduce(
                    (acc, bucket) => ({
                        ...acc,
                        [bucket.id]: bucket[units],
                    }),
                    {}
                ),
            })),
        [data, units]
    )

    let format = (v) => v
    if (units === 'percentage') {
        format = (v) => `${v}%`
    }

    const getLayerColor = ({ id }) => {
        const color = theme.colors.ranges.tools[id]
        if (current !== null && current !== `${namespace}.${id}`) {
            return `${color}33`
        }

        return color
    }

    const formatTick = (id) => {
        const tool = data.find((t) => t.id === id)
        return get(tool, 'entity.name', id)
    }

    return (
        <ResponsiveBar
            margin={margin}
            colors={getLayerColor}
            keys={['would_use', 'would_not_use', 'interested', 'not_interested', 'never_heard']}
            indexBy="tool"
            data={chartData}
            labelTextColor="inherit:darker(2)"
            labelSkipWidth={32}
            labelSkipHeight={20}
            padding={0.6}
            axisTop={{
                format: formatTick,
            }}
            axisRight={null}
            axisBottom={{
                format: formatTick,
            }}
            defs={[theme.charts.emptyPattern]}
            fill={[
                {
                    id: 'empty',
                    match: { id: 'never_heard' },
                },
            ]}
            axisLeft={null}
            enableGridY={false}
            theme={theme.charts}
            labelFormat={format}
            tooltipFormat={format}
        />
    )
}

ToolsSectionOverviewChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            entity: PropTypes.shape({
                name: PropTypes.string.isRequired,
            }).isRequired,
            experience: PropTypes.shape({
                year: PropTypes.shape({
                    buckets: PropTypes.arrayOf(
                        PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            count: PropTypes.number.isRequired,
                            percentage: PropTypes.number.isRequired,
                        })
                    ).isRequired,
                }).isRequired,
            }),
        })
    ).isRequired,
}

export default ToolsSectionOverviewChart
