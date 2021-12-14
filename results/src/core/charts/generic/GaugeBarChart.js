import React, { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import { ResponsiveBar } from '@nivo/bar'
import { useTheme as useNivoTheme } from '@nivo/core'
import { Chip } from '@nivo/tooltip'
import ChartLabel from 'core/components/ChartLabel'
import { isPercentage } from 'core/helpers/units'

// Custom labels using an extra `layer`,
// this way, we can add an extra outline to bar labels
const getLabels =
    units =>
    ({ bars }) => {
        return bars.map(bar => {
            let deltaLabel = ''

            // skip legend for small bars
            if (bar.width < 60) return null

            // only keep 1 decimal
            let value = Math.round(bar.data.value * 10) / 10

            if (isPercentage(units)) value = `${value}%`

            // delta is not shown right now
            // const deltaValue = bar.data.data[`${bar.data.id}_${units}Delta`]
            // if (typeof deltaValue !== 'undefined' && deltaValue !== null) {
            //     deltaLabel = deltaValue > 0 ? `+${deltaValue}` : deltaValue
            //     if (units === 'percentage') deltaLabel = `${deltaLabel}%`
            //     deltaLabel = `(${deltaLabel})`
            // }

            // `pointerEvents: none` is used to not
            // disturb mouse events
            return (
                <ChartLabel
                    key={bar.key}
                    label={`${value} ${deltaLabel}`}
                    transform={`translate(${bar.x + bar.width / 2},${bar.y + bar.height / 2})`}
                    style={{ pointerEvents: 'none' }}
                />
            )
        })
    }

const Tooltip = ({ translate, i18nNamespace, bar, units }) => {
    const theme = useNivoTheme()
    return (
        <div style={theme.tooltip.container}>
            <div style={theme.tooltip.basic}>
                <Chip color={bar.color} style={{ marginRight: 7 }} />
                <span
                    dangerouslySetInnerHTML={{
                        __html: translate(`options.${i18nNamespace}.${bar.id}`)
                    }}
                />
                :{' '}
                <strong>
                    {bar.data[`${bar.id}_${units}`]}
                    {isPercentage(units) && '%'}
                </strong>
            </div>
        </div>
    )
}

const GaugeBarChart = ({
    buckets,
    keys,
    colorMapping,
    units,
    applyEmptyPatternTo,
    i18nNamespace
}) => {
    const { translate } = useI18n()
    const theme = useTheme()

    const data = useMemo(
        () => [
            buckets.reduce((acc, bucket) => {
                return {
                    ...acc,
                    [bucket.id]: bucket[units],
                    [`${bucket.id}_count`]: bucket.count,
                    [`${bucket.id}_percentage_survey`]: bucket.percentage_survey,
                    [`${bucket.id}_percentage_question`]: bucket.percentage_question,
                    [`${bucket.id}_percentage_facet`]: bucket.percentage_facet,
                    [`${bucket.id}_countDelta`]: bucket.countDelta,
                    [`${bucket.id}_percentageDelta`]: bucket.percentageDelta
                }
            }, {})
        ],
        [buckets, units]
    )

    const colors = useMemo(() => {
        const colorById = colorMapping.reduce(
            (acc, m) => ({
                ...acc,
                [m.id]: m.color
            }),
            {}
        )

        return bar => {
            return colorById[bar.id]
        }
    }, [colorMapping])

    const labelsLayer = useMemo(() => getLabels(units), [units])
    const patternRules = useMemo(
        () => [
            {
                id: 'empty',
                match: { id: applyEmptyPatternTo }
            }
        ],
        [applyEmptyPatternTo]
    )

    return (
        <ResponsiveBar
            data={data}
            keys={keys}
            layout="horizontal"
            indexBy={() => 'serie'}
            enableLabel={false}
            labelTextColor={{
                from: 'color',
                modifiers: [['brighter', 1.4]]
            }}
            axisLeft={null}
            axisBottom={null}
            enableGridX={false}
            enableGridY={false}
            animate={false}
            theme={theme.charts}
            layers={['bars', labelsLayer]}
            // defs={[theme.charts.emptyPattern]}
            // fill={patternRules}
            tooltip={bar => (
                <Tooltip
                    bar={bar}
                    translate={translate}
                    i18nNamespace={i18nNamespace}
                    units={units}
                />
            )}
            colors={colors}
            defs={colorMapping.map(({ id, gradientColors }) => ({
                id,
                type: 'linearGradient',
                x1: 0,
                y1: 1,
                x2: 1,
                y2: 1,
                colors: [
                    { offset: 0, color: gradientColors[0] },
                    { offset: 100, color: gradientColors[1] }
                ]
            }))}
            fill={colorMapping.map(({ id }) => ({ match: {id }, id}))}
        />
    )
}

GaugeBarChart.propTypes = {
    buckets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired,
            percentage_survey: PropTypes.number,
            percentage_question: PropTypes.number,
            percentage_facet: PropTypes.number
        }).isRequired
    ).isRequired,
    colorMapping: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired
        })
    ).isRequired,
    units: PropTypes.oneOf([
        'count',
        'percentage_facet',
        'percentage_survey',
        'percentage_question'
    ]),
    applyEmptyPatternTo: PropTypes.string,
    i18nNamespace: PropTypes.string.isRequired
}

export default GaugeBarChart
