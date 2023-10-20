import React, { useMemo } from 'react'
import { useTheme } from 'styled-components'
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
import { StandardQuestionData, BucketUnits, Bucket, Entity } from '@devographics/types'
import { FacetItem, DataSeries, ChartModes, CustomizationFiltersSeries } from 'core/filters/types'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import sortBy from 'lodash/sortBy'
import InsufficientData from './InsufficientData'

export const getChartDataPath = (block: BlockDefinition) =>
    `${block?.queryOptions?.subField || 'responses'}.currentEdition.buckets`

export const getChartData = (data: StandardQuestionData, block: BlockDefinition): Array<Bucket> => {
    const buckets = get(data, getChartDataPath(block))
    return buckets
}

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
    series: DataSeries<StandardQuestionData>[]
    gridIndex?: number
    chartDisplayMode?: ChartModes
    showDefaultSeries?: boolean
    facet?: FacetItem
    filters?: CustomizationFiltersSeries[]
    filterLegends?: any
    shouldTranslate?: boolean
}

// if we're only showing a single key, sort by that
// else, default to sorting by count
const getSortKey = (keys: string[]) => {
    if (keys.length === 1) {
        return keys[0]
    } else {
        return 'count'
    }
}

const HorizontalBarChart = ({
    block,
    legends,
    series,
    total,
    i18nNamespace,
    shouldTranslate = true,
    mode,
    units,
    chartProps,
    size = 'm',
    barColor: barColor_,
    gridIndex,
    facet,
    filters,
    filterLegends,
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

    const theme = useTheme()
    const { translate } = useI18n()

    const bucketEntities = buckets.map(b => b.entity).filter(e => !!e) as Array<Entity> // the filter guarantee that we eliminate null values
    const entities: Entity[] = bucketEntities.length > 0 ? bucketEntities : useEntities()

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

    // let sortedBuckets = sortBy(buckets, getSortKey(keys))
    let sortedBuckets = [...buckets].reverse()

    if (units === BucketUnits.AVERAGE) {
        sortedBuckets = sortBy(sortedBuckets, BucketUnits.AVERAGE)
    }
    const { formatTick, formatValue, maxValue } = useBarChart({
        buckets: sortedBuckets,
        total,
        i18nNamespace,
        shouldTranslate,
        mode,
        units
    })

    const defaultBarColor = theme.colors.barColors[0]
    const barColor = barColor_ || defaultBarColor

    const baseSize = barSizes[size]

    const left = getLeftMargin({
        buckets: sortedBuckets,
        shouldTranslate,
        i18nNamespace
    })

    const colors = [barColor.color]

    const labelFormatter = useChartLabelFormatter({ units, facet })

    const labelsLayer = useMemo(() => getLabelsLayer(d => labelFormatter(d.value)), [units, facet])

    return (
        <div style={{ height: sortedBuckets.length * baseSize + 80 }}>
            <ResponsiveBar
                // the default "img" role does not allow nesting of interactive elements
                // so it's important to make it a table instead
                // @see https://github.com/Devographics/Monorepo/issues/266
                role="table"
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
                                shouldTranslate={shouldTranslate}
                                entity={
                                    sortedBuckets.find(b => b.id === tick.value)?.entity ||
                                    entities.find(e => e?.id === tick.value)
                                }
                                label={sortedBuckets.find(b => b.id === tick.value)?.label}
                                itemCount={sortedBuckets.length}
                                role="rowheader"
                                {...tick}
                            />
                        )
                    }
                }}
                tooltip={barProps => (
                    <BarTooltip
                        units={units}
                        legends={legends}
                        i18nNamespace={i18nNamespace}
                        shouldTranslate={shouldTranslate}
                        facet={facet}
                        filters={filters}
                        filterLegends={filterLegends}
                        entity={
                            buckets.find(b => b.id === barProps.data.id)?.entity ||
                            entities.find(e => e?.id === barProps.data.id)
                        }
                        labelFormatter={labelFormatter}
                        {...barProps}
                    />
                )}
                layers={[
                    layerProps => <HorizontalBarStripes {...layerProps} />,
                    'grid',
                    'axes',
                    'bars',
                    labelsLayer,
                    layerProps => <InsufficientData {...layerProps} />
                ]}
                defs={colorDefs}
                fill={colorFills}
                {...chartProps}
            />
        </div>
    )
}

export default HorizontalBarChart
