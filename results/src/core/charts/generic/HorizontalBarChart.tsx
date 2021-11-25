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
import { ChartComponentProps, BlockUnits, BucketItem, BlockLegend, TickItemProps } from 'core/types'

const labelMaxLength = 20

const margin = {
    top: 40,
    right: 20,
    bottom: 50,
    left: 200,
}

const Text = ({ hasLink = false, label }: { hasLink: boolean; label: string }) => {
    const theme = useTheme()
    const shortenLabel = label.length > labelMaxLength
    const shortLabel = shortenLabel ? label.substr(0, labelMaxLength) + '…' : label

    return (
        <text
            dominantBaseline="central"
            textAnchor="end"
            transform="translate(-10,0) rotate(0)"
            style={{
                fill: hasLink ? theme.colors.link : theme.colors.text,
                fontSize: 14,
                fontFamily: theme.typography.fontFamily,
            }}
        >
            <title>{label}</title>
            {shortLabel || label}
        </text>
    )
}

const TickItem = (tick: TickItemProps) => {
    const { translate } = useI18n()

    const { x, y, value, shouldTranslate, i18nNamespace, entity } = tick

    let label, link

    if (entity) {
        const { name, homepage, github } = entity
        if (name) {
            label = name
        }
        link = homepage || (github && github.url)

        // @todo: remove this once all entities have been added
        if (!label) {
            label = value
        }
    } else if (shouldTranslate) {
        label = translate(`options.${i18nNamespace}.${value}`)
    } else {
        label = value
    }

    return (
        <g transform={`translate(${x},${y})`}>
            {link ? (
                <a href={link}>
                    <Text hasLink={true} label={label} />
                </a>
            ) : (
                <Text hasLink={false} label={label} />
            )}
        </g>
    )
}

export interface HorizontalBarChartProps extends ChartComponentProps {
    total: number
    buckets: BucketItem[]
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
}: HorizontalBarChartProps) => {
    const theme = useTheme()
    const { translate } = useI18n()

    const { formatTick, formatValue, maxValue } = useBarChart({
        buckets,
        total,
        i18nNamespace,
        shouldTranslate: translateData,
        mode,
        units,
    })

    const data = sortBy(
        buckets.map((bucket) => ({ ...bucket })),
        'count'
    )

    return (
        <div style={{ height: buckets.length * 36 + 80 }}>
            <ResponsiveBar
                layout="horizontal"
                margin={margin}
                keys={[units]}
                data={data}
                maxValue={maxValue}
                theme={theme.charts}
                enableGridX={true}
                enableGridY={false}
                enableLabel={true}
                label={(d) => (isPercentage(units) ? `${round(d.value, 1)}%` : d.value)}
                labelTextColor={theme.colors.text}
                labelSkipWidth={40}
                colors={[theme.colors.barChart[colorVariant]]}
                padding={0.4}
                borderRadius={1}
                axisTop={{
                    tickValues: 5,
                    format: formatValue,
                }}
                axisBottom={{
                    tickValues: 5,
                    format: formatValue,
                    legend: translate(`charts.axis_legends.users_${units}`),
                    legendPosition: 'middle',
                    legendOffset: 40,
                }}
                axisLeft={{
                    format: formatTick,
                    tickSize: 0,
                    tickPadding: 10,
                    renderTick: (tick) => {
                        return (
                            <TickItem
                                i18nNamespace={i18nNamespace}
                                shouldTranslate={translateData}
                                entity={buckets.find((b) => b.id === tick.value)?.entity}
                                {...tick}
                            />
                        )
                    },
                }}
                tooltip={(barProps) => (
                    <BarTooltip
                        units={units}
                        i18nNamespace={i18nNamespace}
                        shouldTranslate={translateData}
                        {...barProps}
                    />
                )}
                layers={[
                    (layerProps) => <HorizontalBarStripes {...layerProps} />,
                    'grid',
                    'axes',
                    'bars',
                ]}
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
            percentage: PropTypes.number,
        })
    ),
    i18nNamespace: PropTypes.string.isRequired,
    translateData: PropTypes.bool,
    mode: PropTypes.oneOf(['absolute', 'relative']).isRequired,
    units: PropTypes.oneOf(['count', 'percentage', 'percentage_survey']).isRequired,
    colorVariant: PropTypes.oneOf(['primary', 'secondary']),
}

export default memo(HorizontalBarChart)
