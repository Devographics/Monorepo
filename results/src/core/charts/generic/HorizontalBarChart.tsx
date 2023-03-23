import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from 'styled-components'
import sortBy from 'lodash/sortBy'
import round from 'lodash/round'
import { ResponsiveBar } from '@nivo/bar'
import { useI18n } from 'core/i18n/i18nContext'
import BarTooltip from 'core/charts/generic/BarTooltip'
import HorizontalBarStripes from './HorizontalBarStripes'
import { isPercentage } from 'core/helpers/units'
import { ChartComponentProps, BucketItem, BlockUnits } from '@types/index'
import TickItem, { getBucketLabel } from 'core/charts/generic/TickItem'
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
import { CHART_MODE_DEFAULT } from 'core/blocks/filters/constants'
import { useEntities } from 'core/helpers/entities'
import { moveNoAnswerBucket } from 'core/helpers/data'
import { Bucket } from '@devographics/types'

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

export interface HorizontalBarChartProps extends ChartComponentProps {
    total: number
    buckets: Bucket[]
    size: keyof typeof barSizes
    barColor: BarColor
    facet?: string
}

const marginCoeff = 9

export const getLeftMargin = ({ data, shouldTranslate, i18nNamespace }) => {
    if (data && data.length > 0) {
        const labels = data.map(bucket =>
            getBucketLabel({
                shouldTranslate,
                i18nNamespace,
                id: bucket.id,
                label: bucket.label,
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

const getLabelsLayer = labelTransformer => (props: any) => {
    // adjust settings according to dimensions
    let fontSize = 13
    let rotation = 0
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
    colorMappings,
    barColor: barColor_,
    gridIndex,
    facet,
    chartDisplayMode = CHART_MODE_DEFAULT,
    showDefaultSeries
}: HorizontalBarChartProps) => {
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

    // console.log(chartDisplayMode)
    // console.log(showDefaultSeries)
    // console.log(keys)
    // console.log(colorDefs)
    // console.log(colorFills)

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

    const defaultBarColor = theme.colors.barColors[0]
    const barColor = barColor_ || defaultBarColor

    const baseSize = barSizes[size]

    const left = getLeftMargin({ data, shouldTranslate: translateData, i18nNamespace })

    const colors = [barColor.color]

    const labelFormatter = useChartLabelFormatter({ units, facet })

    const labelsLayer = useMemo(() => getLabelsLayer(labelFormatter), [units, facet])

    return (
        <div style={{ height: buckets.length * baseSize + 80 }}>
            <ResponsiveBar
                layout="horizontal"
                margin={{ ...margin, left }}
                keys={keys}
                data={moveNoAnswerBucket(data)}
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
