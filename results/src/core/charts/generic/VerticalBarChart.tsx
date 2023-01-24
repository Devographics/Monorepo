import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from 'styled-components'
import { ResponsiveBar } from '@nivo/bar'
import { useI18n } from 'core/i18n/i18nContext'
import { useBarChart, useColorDefs, useColorFills, useChartKeys, useChartLabelFormatter } from 'core/charts/hooks'
import BarTooltip from './BarTooltip'
import ChartLabel from 'core/components/ChartLabel'
import { isPercentage } from 'core/helpers/units'
import { ChartComponentProps, BlockUnits, BucketItem, BlockLegend } from 'core/types'
import { CHART_MODE_DEFAULT } from 'core/blocks/filters/constants'
const breakpoint = 600

const getMargins = (viewportWidth: number) => ({
    top: 10,
    right: 70,
    bottom: viewportWidth < breakpoint ? 110 : 60,
    left: 40
})

const getLabelsLayer = labelTransformer => (props: any) => {
    // adjust settings according to dimensions
    let fontSize = 13
    let rotation = 0
    if (props.width < 600) {
        fontSize = 11
        rotation = -90
    }

    return props.bars.map((bar: any) => {
        const label = labelTransformer(bar.data)

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
    chartDisplayMode = CHART_MODE_DEFAULT,
    facet,
    showDefaultSeries,
}: VerticalBarChartProps) => {
    const theme = useTheme()

    const keys = useChartKeys({ units, facet, seriesCount, showDefaultSeries })

    const colorDefs = useColorDefs()
    const colorFills = useColorFills({ chartDisplayMode, gridIndex, keys, facet })

    // console.log(chartDisplayMode)
    // console.log(colorDefs)
    // console.log(colorFills)

    const { translate } = useI18n()

    const { formatValue, maxValue, ticks } = useBarChart({
        buckets,
        total,
        i18nNamespace,
        shouldTranslate: translateData,
        mode,
        units
    })

    const labelFormatter = useChartLabelFormatter({ units, facet })

    const labelsLayer = useMemo(() => getLabelsLayer(labelFormatter), [units, facet])

    const colors = [theme.colors.barChart[colorVariant]]

    return (
        <div style={{ height: 260 }} className={`VerticalBarChart ${className}`}>
            <ResponsiveBar
                data={buckets}
                groupMode={chartDisplayMode}
                indexBy="id"
                keys={keys}
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
                        facet={facet}
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

export default memo(VerticalBarChart)
