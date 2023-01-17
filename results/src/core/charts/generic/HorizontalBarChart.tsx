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
import { ChartComponentProps, BucketItem, BlockUnits } from 'core/types'
import TickItem, { getBucketLabel } from 'core/charts/generic/TickItem'
import maxBy from 'lodash/maxBy'
import ChartLabel from 'core/components/ChartLabel'
import { useKeys } from 'core/blocks/filters/helpers'
import { useBarChart, useColorDefs, useColorFills, HORIZONTAL } from 'core/charts/hooks'

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
    buckets: BucketItem[]
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

/*

When no facet is specified, key is e.g. [count]

If "gender" facet is specified, keys are e.g. ['count__male', 'count__female', ...]

*/
const getKeys = ({ units, facet, allChartKeys }) => {
    if (facet) {
        return allChartKeys[facet].map(key => `${units}__${key}`)
    } else {
        return [units]
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
    colorMappings,
    barColor: barColor_,
    gridIndex = 1,
    facet
}: HorizontalBarChartProps) => {
    const theme = useTheme()
    const { translate } = useI18n()

    const allChartKeys = useKeys()
    const keys = getKeys({ units, facet, allChartKeys })

    const colorDefs = useColorDefs({ orientation: HORIZONTAL })
    const colorFills = useColorFills({ defaultColorIndex: gridIndex, keys, orientation: HORIZONTAL })

    const { formatTick, formatValue, maxValue } = useBarChart({
        buckets,
        total,
        i18nNamespace,
        shouldTranslate: translateData,
        mode,
        units
    })

    console.log('// maxValue')
    console.log(maxValue)

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

    const labelsLayer = useMemo(() => getLabelsLayer(units), [units])

    // const colorDefId = `${barColor.id}GradientHorizontal`

    // const colorDefs = [
    //     {
    //         id: colorDefId,
    //         type: 'linearGradient',
    //         x1: 0,
    //         y1: 1,
    //         x2: 1,
    //         y2: 1,
    //         colors: [
    //             { offset: 0, color: barColor.gradient[0] },
    //             { offset: 100, color: barColor.gradient[1] }
    //         ]
    //     }
    // ]

    return (
        <div style={{ height: buckets.length * baseSize + 80 }}>
            <ResponsiveBar
                layout="horizontal"
                margin={{ ...margin, left }}
                keys={keys}
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

export default HorizontalBarChart
