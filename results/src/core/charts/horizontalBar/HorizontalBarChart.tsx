import React, { useMemo } from 'react'
import { useTheme } from 'styled-components'
import sortBy from 'lodash/sortBy'
import { ResponsiveBar } from '@nivo/bar'
import { useI18n } from 'core/i18n/i18nContext'
import BarTooltip from 'core/charts/common/BarTooltip'
import HorizontalBarStripes from './HorizontalBarStripes'
import { BlockDefinition, ChartComponentProps } from 'core/types/index'
import TickItem, { getBucketLabel } from 'core/charts/common/TickItem'
import maxBy from 'lodash/maxBy'
import ChartLabel from 'core/components/ChartLabel'
import {
    useBarChart,
    useColorDefs,
    useColorFills,
    useChartKeys,
    useChartLabelFormatter,
    HORIZONTAL
} from 'core/charts/hooks'
import { useEntities } from 'core/helpers/entities'
import { StandardQuestionData, BucketUnits, Bucket } from '@devographics/types'
import { FacetItem, DataSeries, ChartModes } from 'core/filters/types'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'

export const getChartDataPath = (block: BlockDefinition) =>
    `${block?.queryOptions?.subField || 'responses'}.currentEdition.buckets`

export const getChartData = (data: StandardQuestionData, block: BlockDefinition) =>
    get(data, getChartDataPath(block))

export const margin = {
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

type BarColor = {
    id: string
    color: string
    gradient: string[]
}

const marginCoeff = 9

export const getLeftMargin = ({
    buckets,
    shouldTranslate,
    i18nNamespace
}: {
    buckets: Bucket[]
    shouldTranslate: boolean
    i18nNamespace: string
}) => {
    if (buckets && buckets.length > 0) {
        const labels = buckets.map(
            bucket =>
                getBucketLabel({
                    shouldTranslate,
                    i18nNamespace,
                    id: bucket.id,
                    label: bucket.label,
                    entity: bucket.entity,
                    shortenLabel: true
                }).label
        )
        const longestLabel = maxBy(labels, l => l.length)
        const longestLabelLength = longestLabel ? longestLabel.length : 100
        return longestLabelLength * marginCoeff
    } else {
        return margin.left
    }
}

const getLabelsLayer = (labelTransformer: any) => (props: any) => {
    // adjust settings according to dimensions
    const fontSize = 13
    const rotation = 0
    // if (props.width < 600) {
    //     fontSize = 11
    //     rotation = -90
    // }

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

const baseUnits = Object.values(BucketUnits)

export interface HorizontalBarChartProps extends ChartComponentProps {
    block: BlockDefinition
    total: number
    size?: keyof typeof barSizes
    barColor?: BarColor
    facet?: FacetItem
    series: DataSeries<StandardQuestionData>[]
    gridIndex?: number
    chartDisplayMode?: ChartModes
    showDefaultSeries?: boolean
}

const HorizontalBarChart = ({
    block,
    series,
    total,
    i18nNamespace,
    translateData = false,
    mode,
    units,
    chartProps,
    size = 'm',
    barColor: barColor_,
    gridIndex,
    facet,
    chartDisplayMode = ChartModes.CHART_MODE_DEFAULT,
    showDefaultSeries
}: HorizontalBarChartProps) => {
    // TODO: currently this chart only receive one data series, but if it receives more
    // in the future it will be able to combine them into a single chart
    let buckets = cloneDeep(getChartData(series[0].data, block))

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

    console.log(buckets)

    const theme = useTheme()
    const { translate } = useI18n()

    const bucketEntities = buckets.map(b => b.entity).filter(b => !!b)
    const entities = bucketEntities.length > 0 ? bucketEntities : useEntities()

    const keys = useChartKeys({ units, facet, showDefaultSeries })

    const colorDefs = useColorDefs({ orientation: HORIZONTAL })
    const colorFills = useColorFills({
        chartDisplayMode,
        gridIndex,
        keys,
        orientation: HORIZONTAL,
        facet,
        showDefaultSeries
    })

    const { formatTick, formatValue, maxValue } = useBarChart({
        buckets,
        total,
        i18nNamespace,
        shouldTranslate: translateData,
        mode,
        units
    })

    const sortedBuckets = sortBy(buckets, 'count')

    const defaultBarColor = theme.colors.barColors[0]
    const barColor = barColor_ || defaultBarColor

    const baseSize = barSizes[size]

    const left = getLeftMargin({
        buckets: sortedBuckets,
        shouldTranslate: translateData,
        i18nNamespace
    })

    const colors = [barColor.color]

    const labelFormatter = useChartLabelFormatter({ units, facet })

    const labelsLayer = useMemo(() => getLabelsLayer(labelFormatter), [units, facet])

    return (
        <div style={{ height: buckets.length * baseSize + 80 }}>
            <ResponsiveBar
                layout="horizontal"
                margin={{ ...margin, left }}
                keys={keys}
                data={sortedBuckets}
                maxValue={maxValue}
                theme={theme.charts}
                enableGridX={true}
                enableGridY={false}
                enableLabel={false}
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
                                entity={entities.find(e => e?.id === tick.value)}
                                label={buckets.find(b => b.id === tick.value)?.label}
                                itemCount={buckets.length}
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
                    'bars',
                    labelsLayer
                ]}
                defs={colorDefs}
                fill={colorFills}
                {...chartProps}
            />
        </div>
    )
}

export default HorizontalBarChart
