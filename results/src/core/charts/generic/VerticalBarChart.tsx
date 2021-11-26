import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from 'styled-components'
import { ResponsiveBar } from '@nivo/bar'
import { useI18n } from 'core/i18n/i18nContext'
import { useBarChart } from 'core/charts/hooks'
import BarTooltip from './BarTooltip'
import ChartLabel from 'core/components/ChartLabel'
import { isPercentage } from 'core/helpers/units'
import { ChartComponentProps, BlockUnits, BucketItem, BlockLegend } from 'core/types'

const breakpoint = 600

const getMargins = (viewportWidth: number) => ({
    top: 10,
    right: 70,
    bottom: viewportWidth < breakpoint ? 110 : 60,
    left: 40,
})

const getLabelsLayer = (units: BlockUnits) => (props: any) => {
    // adjust settings according to dimensions
    let fontSize = 13
    let rotation = 0
    if (props.width < 600) {
        fontSize = 11
        rotation = -90
    }

    return props.bars.map((bar: any) => {
        const label = isPercentage(units) ? `${bar.data.value}%` : bar.data.value

        return (
            <ChartLabel
                key={bar.key}
                label={label}
                transform={`translate(${bar.x + bar.width / 2},${
                    bar.y + bar.height / 2
                }) rotate(${rotation})`}
                fontSize={fontSize}
                style={{
                    pointerEvents: 'none',
                }}
            />
        )
    })
}

const getAxisLabels = (v: any, legends: BlockLegend[]) => {
    const key = legends.find((key) => key.id === v)
    return key && (key.shortLabel || key.label)
}

export interface VerticalBarChartProps extends ChartComponentProps {
    total: number
    buckets: BucketItem[]
}

const VerticalBarChart = ({
    viewportWidth,
    className,
    bucketKeys,
    total,
    i18nNamespace,
    translateData,
    mode,
    units,
    chartProps,
    colorVariant = 'primary',
    buckets,
}: VerticalBarChartProps) => {
    const theme = useTheme()
    const { translate } = useI18n()

    const { formatValue, maxValue, ticks } = useBarChart({
        buckets,
        total,
        i18nNamespace,
        shouldTranslate: translateData,
        mode,
        units,
    })

    const labelsLayer = useMemo(() => getLabelsLayer(units), [units])

    return (
        <div style={{ height: 260 }} className={`VerticalBarChart ${className}`}>
            <ResponsiveBar
                data={buckets}
                indexBy="id"
                keys={[units]}
                maxValue={maxValue}
                margin={getMargins(viewportWidth)}
                padding={0.4}
                theme={theme.charts}
                animate={false}
                colors={[theme.colors.barChart[colorVariant]]}
                borderRadius={1}
                enableLabel={false}
                enableGridX={false}
                gridYValues={ticks}
                enableGridY={true}
                axisLeft={{
                    format: formatValue,
                    tickValues: ticks,
                }}
                axisRight={{
                    format: formatValue,
                    tickValues: ticks,
                    legend: translate(`charts.axis_legends.users_${units}`),
                    legendPosition: 'middle',
                    legendOffset: 52,
                }}
                axisBottom={{
                    format: (v) => getAxisLabels(v, bucketKeys),
                    legend: translate(`charts.axis_legends.${i18nNamespace}`),
                    legendPosition: 'middle',
                    legendOffset: viewportWidth < breakpoint ? 90 : 50,
                    tickRotation: viewportWidth < breakpoint ? -45 : 0,
                }}
                tooltip={(barProps) => (
                    <BarTooltip
                        units={units}
                        i18nNamespace={i18nNamespace}
                        shouldTranslate={translateData}
                        {...barProps}
                    />
                )}
                layers={['grid', 'axes', 'bars', labelsLayer]}
                {...chartProps}
            />
        </div>
    )
}

VerticalBarChart.propTypes = {
    total: PropTypes.number,
    buckets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
            count: PropTypes.number.isRequired,
            percentage: PropTypes.number,
        })
    ).isRequired,
    i18nNamespace: PropTypes.string.isRequired,
    translateData: PropTypes.bool.isRequired,
    mode: PropTypes.oneOf(['absolute', 'relative']).isRequired,
    units: PropTypes.oneOf(['percentage_survey', 'percentage_question', 'count']).isRequired,
    colorVariant: PropTypes.oneOf(['primary', 'secondary']),
}
VerticalBarChart.defaultProps = {
    translateData: true,
}

export default memo(VerticalBarChart)
