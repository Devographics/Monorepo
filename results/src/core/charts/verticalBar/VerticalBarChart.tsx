import React, { memo, useMemo } from 'react'
import { useTheme } from 'styled-components'
import { ResponsiveBar } from '@nivo/bar'
import { useI18n } from 'core/i18n/i18nContext'
import {
    useBarChart,
    useColorDefs,
    useColorFills,
    useChartKeys,
    useChartLabelFormatter
} from 'core/charts/hooks'
import BarTooltip from '../common/BarTooltip'
import ChartLabel from 'core/components/ChartLabel'
import { ChartComponentProps, BlockLegend, BlockDefinition } from 'core/types/index'
import { handleNoAnswerBucket } from 'core/helpers/data'
import { StandardQuestionData, BucketUnits } from '@devographics/types'
import { combineBuckets } from 'core/filters/helpers'
import { DataSeries, ChartModes, FacetItem } from 'core/filters/types'
import cloneDeep from 'lodash/cloneDeep'

const baseUnits = Object.values(BucketUnits)

export const getChartData = (data: StandardQuestionData) => data?.responses?.currentEdition.buckets

/*

Combine multiple series into a single chart

*/
export const combineSeries = (dataSeries: DataSeries<StandardQuestionData>[]) => {
    const allBuckets = dataSeries.map(series => getChartData(series.data))
    // get chart data (buckets) for each series
    const combinedBuckets = combineBuckets({
        allBuckets
    })
    return combinedBuckets
}

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
    block: BlockDefinition
    total: number
    series: DataSeries<StandardQuestionData>[]
    gridIndex?: number
    chartDisplayMode?: ChartModes
    facet?: FacetItem
    showDefaultSeries?: boolean
}

const VerticalBarChart = (props: VerticalBarChartProps) => {
    const {
        block,
        viewportWidth,
        className,
        legends,
        total,
        i18nNamespace,
        translateData,
        mode,
        units,
        chartProps,
        colorVariant = 'primary',
        gridIndex = 1,
        chartDisplayMode = ChartModes.CHART_MODE_DEFAULT,
        facet,
        showDefaultSeries,
        series
    } = props

    // by default this chart only receive one data series, but if it receives more
    // it can combine them into a single chart
    let buckets = cloneDeep(
        series.length > 1 ? combineSeries(series, showDefaultSeries) : getChartData(series[0].data)
    )

    if (facet) {
        buckets = buckets.map(bucket => {
            bucket?.facetBuckets?.forEach(facetBucket => {
                baseUnits.forEach(unit => {
                    bucket[`${unit}__${facetBucket.id}`] = facetBucket[unit]
                })
            })
            return bucket
        })
    }

    const theme = useTheme()

    const keys = useChartKeys({ units, facet, seriesCount: series.length, showDefaultSeries })

    const colorDefs = useColorDefs()
    const colorFills = useColorFills({ chartDisplayMode, gridIndex, keys, facet })

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

    if (block.id === 'years_of_experience') {
        console.log(block.id)
        console.log(buckets)
        console.log(handleNoAnswerBucket({ buckets, units, moveTo: 'end' }))
        console.log(keys)
    }

    return (
        <div style={{ height: 260 }} className={`VerticalBarChart ${className}`}>
            <ResponsiveBar
                data={handleNoAnswerBucket({ buckets, units, moveTo: 'end' })}
                groupMode={chartDisplayMode}
                indexBy="id"
                keys={keys}
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
                    format: v => getAxisLabels(v, legends),
                    // legend: translate(`charts.axis_legends.${i18nNamespace}`),
                    legendPosition: 'middle',
                    legendOffset: viewportWidth < breakpoint ? 90 : 50,
                    tickRotation: viewportWidth < breakpoint ? -45 : 0
                }}
                tooltip={barProps => (
                    <BarTooltip
                        units={units}
                        legends={legends}
                        i18nNamespace={i18nNamespace}
                        shouldTranslate={translateData}
                        facet={facet}
                        {...barProps}
                    />
                )}
                layers={['grid', 'axes', 'bars', labelsLayer]}
            />
        </div>
    )
}

export default VerticalBarChart
