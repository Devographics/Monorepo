import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from 'styled-components'
import { ResponsiveBar } from '@nivo/bar'
import { useI18n } from 'core/i18n/i18nContext'
import { useBarChart, useColorDefs, useColorFills } from 'core/charts/hooks'
import BarTooltip from './BarTooltip'
import ChartLabel from 'core/components/ChartLabel'
import { isPercentage } from 'core/helpers/units'
import { ChartComponentProps, BlockUnits, BucketItem, BlockLegend } from 'core/types'
const breakpoint = 600

const getMargins = (viewportWidth: number) => ({
    top: 10,
    right: 70,
    bottom: viewportWidth < breakpoint ? 110 : 60,
    left: 40
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
                    pointerEvents: 'none'
                }}
            />
        )
    })
}

const getAxisLabels = (v: any, legends: BlockLegend[]) => {
    const key = legends && legends.find(key => key.id === v)
    return key && (key.shortLabel || key.label)
}

export interface VerticalBarChartProps extends ChartComponentProps {
    total: number
    buckets: BucketItem[]
    seriesCount: number
}

const getKeys = (units, seriesCount) => {
    return [...Array(seriesCount)].map((x, i) => (i === 0 ? units : `${units}__${i + 1}`))
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
    seriesCount,
    chartProps,
    colorVariant = 'primary',
    buckets,
    gridIndex = 1,
}: VerticalBarChartProps) => {
    const theme = useTheme()
    const colorDefs = useColorDefs()
    const colorFills = useColorFills({ defaultColorIndex: gridIndex })
    const { translate } = useI18n()

    const { formatValue, maxValue, ticks } = useBarChart({
        buckets,
        total,
        i18nNamespace,
        shouldTranslate: translateData,
        mode,
        units
    })

    const labelsLayer = useMemo(() => getLabelsLayer(units), [units])

    const colors = [theme.colors.barChart[colorVariant]]

    return (
        <div style={{ height: 260 }} className={`VerticalBarChart ${className}`}>
            <ResponsiveBar
                data={buckets}
                groupMode="grouped"
                indexBy="id"
                keys={getKeys(units, seriesCount)}
                maxValue={maxValue}
                margin={getMargins(viewportWidth)}
                padding={0.4}
                theme={theme.charts}
                animate={false}
                colors={colors}
                borderRadius={1}
                enableLabel={false}
                enableGridX={false}
                gridYValues={ticks}
                enableGridY={true}
                innerPadding={4}
                axisLeft={{
                    format: formatValue,
                    tickValues: ticks
                }}
                axisRight={{
                    format: formatValue,
                    tickValues: ticks,
                    legend: translate(`charts.axis_legends.users_${units}`),
                    legendPosition: 'middle',
                    legendOffset: 52
                }}
                axisBottom={{
                    format: v => getAxisLabels(v, bucketKeys),
                    // legend: translate(`charts.axis_legends.${i18nNamespace}`),
                    legendPosition: 'middle',
                    legendOffset: viewportWidth < breakpoint ? 90 : 50,
                    tickRotation: viewportWidth < breakpoint ? -45 : 0
                }}
                tooltip={barProps => (
                    <BarTooltip
                        units={units}
                        bucketKeys={bucketKeys}
                        i18nNamespace={i18nNamespace}
                        shouldTranslate={translateData}
                        {...barProps}
                    />
                )}
                layers={['grid', 'axes', 'bars', labelsLayer]}
                defs={colorDefs}
                fill={colorFills}
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
            percentage: PropTypes.number
        })
    ).isRequired,
    i18nNamespace: PropTypes.string.isRequired,
    translateData: PropTypes.bool.isRequired,
    mode: PropTypes.oneOf(['absolute', 'relative']).isRequired,
    units: PropTypes.oneOf(['percentage_survey', 'percentage_question', 'count']).isRequired,
    colorVariant: PropTypes.oneOf(['primary', 'secondary'])
}
VerticalBarChart.defaultProps = {
    translateData: true
}

export default memo(VerticalBarChart)
