import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from 'styled-components'
import sortBy from 'lodash/sortBy'
import round from 'lodash/round'
import { ResponsiveBar } from '@nivo/bar'
import { useI18n } from 'core/i18n/i18nContext'
import { useBarChart } from 'core/charts/hooks'
import BarTooltip from 'core/charts/generic/BarTooltip'
import HorizontalBarStripes from './HorizontalBarStripes'
import { isPercentage } from 'core/helpers/units'
import { ChartComponentProps, BucketItem } from 'core/types'
import TickItem, { getBucketLabel } from 'core/charts/generic/TickItem'
import maxBy from 'lodash/maxBy'

const margin = {
    top: 40,
    right: 20,
    bottom: 50,
    left: 200
}

const barSizes = {
    s: 30,
    m: 40,
    l: 50
}

export interface HorizontalBarChartProps extends ChartComponentProps {
    total: number
    buckets: BucketItem[]
    size: keyof typeof barSizes
}

const marginCoeff = 9

const getLeftMargin = ({ data, shouldTranslate, i18nNamespace }) => {
    if (data && data.length > 0) {
        const labels = data.map(bucket =>
            getBucketLabel({
                shouldTranslate,
                i18nNamespace,
                id: bucket.id,
                entity: bucket.entity,
                shortenLabel: true
            })
        )
        const longestLabel = maxBy(labels, l => l.length)
        const longestLabelLength = longestLabel ? longestLabel.length : 100
        return longestLabelLength * marginCoeff
    } else {
        return margin.left
    }
}

const HorizontalBarChart = ({
    buckets,
    total,
    i18nNamespace,
    translateData = false,
    mode,
    units,
    chartProps,
    colorVariant = 'primary',
    size = 'm',
    colorMappings
}: HorizontalBarChartProps) => {
    const theme = useTheme()
    const { translate } = useI18n()

    const { formatTick, formatValue, maxValue } = useBarChart({
        buckets,
        total,
        i18nNamespace,
        shouldTranslate: translateData,
        mode,
        units
    })

    const data = useMemo(
        () =>
            sortBy(
                buckets.map(bucket => ({ ...bucket })),
                'count'
            ),
        [buckets]
    )

    const baseSize = barSizes[size]

    const left = getLeftMargin({ data, shouldTranslate: translateData, i18nNamespace })

    const colors = [theme.colors.barChart[colorVariant]]
    const gradientColors = theme.colors.barChart[`${colorVariant}Gradient`]

    return (
        <div style={{ height: buckets.length * baseSize + 80 }}>
            <ResponsiveBar
                layout="horizontal"
                margin={{ ...margin, left }}
                keys={[units]}
                data={data}
                maxValue={maxValue}
                theme={theme.charts}
                enableGridX={true}
                enableGridY={false}
                enableLabel={true}
                label={d => (isPercentage(units) ? `${round(d.value, 1)}%` : d.value)}
                labelTextColor={theme.colors.text}
                labelSkipWidth={40}
                colors={colors}
                padding={0.4}
                borderRadius={1}
                axisTop={{
                    tickValues: 5,
                    format: formatValue
                }}
                axisBottom={{
                    tickValues: 5,
                    format: formatValue,
                    legend: translate(`charts.axis_legends.users_${units}`),
                    legendPosition: 'middle',
                    legendOffset: 40
                }}
                axisLeft={{
                    format: formatTick,
                    tickSize: 0,
                    tickPadding: 10,
                    renderTick: tick => {
                        return (
                            <TickItem
                                i18nNamespace={i18nNamespace}
                                shouldTranslate={translateData}
                                entity={buckets.find(b => b.id === tick.value)?.entity}
                                {...tick}
                            />
                        )
                    }
                }}
                tooltip={barProps => (
                    <BarTooltip
                        units={units}
                        i18nNamespace={i18nNamespace}
                        shouldTranslate={translateData}
                        {...barProps}
                    />
                )}
                layers={[
                    layerProps => <HorizontalBarStripes {...layerProps} />,
                    'grid',
                    'axes',
                    'bars'
                ]}
                defs={[
                    {
                        id: `${colorVariant}GradientHorizontal`,
                        type: 'linearGradient',
                        x1: 0,
                        y1: 1,
                        x2: 1,
                        y2: 1,
                        colors: [
                            { offset: 0, color: gradientColors[0] },
                            { offset: 100, color: gradientColors[1] }
                        ],
                    }
                ]}
                fill={[{ match: '*', id: `${colorVariant}GradientHorizontal` }]}
                {...chartProps}
            />
        </div>
    )
}

HorizontalBarChart.propTypes = {
    total: PropTypes.number.isRequired,
    buckets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
            percentage: PropTypes.number
        })
    ),
    i18nNamespace: PropTypes.string.isRequired,
    translateData: PropTypes.bool,
    mode: PropTypes.oneOf(['absolute', 'relative']).isRequired,
    units: PropTypes.oneOf(['count', 'percentage', 'percentage_survey']).isRequired,
    colorVariant: PropTypes.oneOf(['primary', 'secondary'])
}

export default memo(HorizontalBarChart)
